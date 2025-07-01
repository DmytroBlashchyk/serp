import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionActivationCommand } from 'modules/payments/commands/subscription-activation.command';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { BadRequestException } from '@nestjs/common';
import { GatewayService } from 'modules/gateway/services/gateway.service';

@CommandHandler(SubscriptionActivationCommand)
export class SubscriptionActivationCommandHandler
  implements ICommandHandler<SubscriptionActivationCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly paddleService: PaddleService,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly defaultTariffPlanLimitRepository: DefaultTariffPlanLimitRepository,
    private readonly accountLimitRepository: AccountLimitRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly accountRepository: AccountRepository,
    private readonly gatewayService: GatewayService,
  ) {}
  /**
   * Executes the subscription activation process.
   *
   * @param {SubscriptionActivationCommand} command - The command containing details necessary for activating a subscription.
   * @return {Promise<void>} - A promise that resolves when the activation process is complete.
   */
  @Transactional()
  async execute(command: SubscriptionActivationCommand): Promise<void> {
    this.cliLoggingService.log(`START: SubscriptionActivationCommandHandler`);
    try {
      const status =
        await this.subscriptionStatusRepository.getSubscriptionStatusByName(
          SubscriptionStatusesEnum.activated,
        );
      const subscription = await this.paddleService.getSubscription(
        command.subscriptionId,
      );
      for (const item of subscription.items) {
        const tariffPlanSetting =
          await this.tariffPlanSettingRepository.getTariffPlansByPaddleId(
            item.price.id,
          );
        if (!tariffPlanSetting) {
          throw new BadRequestException(
            `TariffPlanSetting by paddle price id not found.`,
          );
        }

        const account = await this.accountRepository.getAccountWithSubscription(
          command.accountId,
        );
        await this.subscriptionRepository.save({
          ...account.subscription,
          subscriptionId: subscription.id,
          customerId: subscription.customerId,
          tariffPlanSetting,
          status,
          activationDate: item.previouslyBilledAt,
          statusUpdateDate: item.nextBilledAt,
        });
        await this.accountLimitRepository.removeAccountLimits(
          command.accountId,
        );
        const tariffPlanLimits =
          await this.defaultTariffPlanLimitRepository.getAllLimitsByTariffPlan(
            tariffPlanSetting.tariffPlan.name,
          );
        await this.accountLimitRepository.save(
          tariffPlanLimits.map((limit) => {
            return {
              account: { id: command.accountId },
              accountLimitType: limit.limitType,
              limit: limit.limit,
            };
          }),
        );
        await this.gatewayService.handleUpdatedAllAccountLimits(
          command.accountId,
        );
        if (account.deletedAt !== null) {
          await this.accountRepository.save({
            id: account.id,
            deletedAt: null,
          });
        }
      }
      this.cliLoggingService.log(`END: SubscriptionActivationCommandHandler`);
    } catch (error) {
      this.cliLoggingService.error(
        `SubscriptionActivationCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
