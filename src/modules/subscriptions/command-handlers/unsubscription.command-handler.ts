import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UnsubscriptionCommand } from 'modules/subscriptions/commands/unsubscription.command';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { TypesOfReasonsForUnsubscriptionRepository } from 'modules/subscriptions/repositories/types-of-reasons-for-unsubscription.repository';
import { ReasonsForUnsubscriptionRepository } from 'modules/subscriptions/repositories/reasons-for-unsubscription.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@CommandHandler(UnsubscriptionCommand)
export class UnsubscriptionCommandHandler
  implements ICommandHandler<UnsubscriptionCommand>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly paddleService: PaddleService,
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly typesOfReasonsForUnsubscriptionRepository: TypesOfReasonsForUnsubscriptionRepository,
    private readonly reasonsForUnsubscriptionRepository: ReasonsForUnsubscriptionRepository,
    private readonly cliLoggingService: CliLoggingService,
  ) {}
  /**
   * Executes the unsubscribe command by canceling the subscription
   * and logging the reason for the unsubscription.
   * @param {UnsubscriptionCommand} command - The command containing
   * details required to execute the unsubscription process.
   * @return {Promise<void>} - Resolves when the operation is complete.
   */
  async execute(command: UnsubscriptionCommand): Promise<void> {
    try {
      const account = await this.accountRepository.getAccountWithSubscription(
        command.accountId,
      );
      if (!account) {
        throw new NotFoundException('Account subscription not found.');
      }
      if (
        account.subscription.tariffPlanSetting.tariffPlan.name ===
        TariffPlansEnum.TrialPeriod
      ) {
        throw new BadRequestException("You can't cancel a trial period");
      }
      const result = await this.paddleService.unsubscribe(
        account.subscription.subscriptionId,
      );
      const status =
        await this.subscriptionStatusRepository.getSubscriptionStatusByName(
          SubscriptionStatusesEnum.canceled,
        );
      if (result.id) {
        await this.subscriptionRepository.save({
          ...account.subscription,
          status,
        });
      }

      const typeOfReason =
        await this.typesOfReasonsForUnsubscriptionRepository.getTypeByName(
          command.typeOfReason,
        );
      await this.reasonsForUnsubscriptionRepository.save({
        accountId: command.accountId,
        reason: command.reason,
        type: typeOfReason,
      });
    } catch (error) {
      this.cliLoggingService.error(
        `Error: UnsubscriptionCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
