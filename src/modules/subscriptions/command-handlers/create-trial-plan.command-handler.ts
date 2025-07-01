import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateTrialPlanCommand } from 'modules/subscriptions/commands/create-trial-plan.command';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { CreateAccountLimitsEvent } from 'modules/account-limits/events/create-account-limits.event';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';

@CommandHandler(CreateTrialPlanCommand)
export class CreateTrialPlanCommandHandler
  implements ICommandHandler<CreateTrialPlanCommand>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly eventBus: EventBus,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(Queues.Mailing)
    private readonly mailingQueue: Queue,
  ) {}
  /**
   * Executes the given CreateTrialPlanCommand to create a trial plan subscription
   * for the specified account if it does not already have a subscription.
   *
   * @param {CreateTrialPlanCommand} command - The command containing the account ID and related data to create a trial plan.
   * @return {Promise<void>} - A promise that resolves when the execution is complete.
   */
  async execute(command: CreateTrialPlanCommand) {
    try {
      const account = await this.accountRepository.getAccountById(
        command.accountId,
      );
      if (!account.subscription) {
        const tariffPlanSetting =
          await this.tariffPlanSettingRepository.getTrialTariffPlan();
        const status =
          await this.subscriptionStatusRepository.getSubscriptionStatusByName(
            SubscriptionStatusesEnum.activated,
          );
        const activationDate = new Date();

        const statusUpdateDate = new Date(
          activationDate.getTime() + 14 * 24 * 60 * 60 * 1000,
        );
        const subscription = await this.subscriptionRepository.save({
          account,
          tariffPlanSetting,
          status,
          activationDate,
          statusUpdateDate,
          transactionId: '',
          subscriptionId: '',
        });
        await this.accountRepository.save({ ...account, subscription });
        this.eventBus.publish(
          new CreateAccountLimitsEvent({
            accountId: account.id,
            tariffPlanName: TariffPlansEnum.TrialPeriod,
          }),
        );

        await this.mailingQueue.add(QueueEventEnum.SendWelcomeLetter, {
          userId: account.owner.id,
        });
      }
    } catch (error) {
      this.cliLoggingService.error(
        `Error: CreateTrialPlanCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
