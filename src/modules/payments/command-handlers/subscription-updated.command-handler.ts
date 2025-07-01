import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SubscriptionUpdatedCommand } from 'modules/payments/commands/subscription-updated.command';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { BadRequestException } from '@nestjs/common';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { BillingResponseFactory } from 'modules/subscriptions/factories/billing-response.factory';

@CommandHandler(SubscriptionUpdatedCommand)
export class SubscriptionUpdatedCommandHandler
  implements ICommandHandler<SubscriptionUpdatedCommand>
{
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly paddleService: PaddleService,
    private readonly accountLimitRepository: AccountLimitRepository,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly accountRepository: AccountRepository,
    private readonly defaultTariffPlanLimitRepository: DefaultTariffPlanLimitRepository,
    private readonly gatewayService: GatewayService,
    private readonly billingResponseFactory: BillingResponseFactory,
  ) {}
  /**
   * Executes the SubscriptionUpdatedCommand to update the status, handle changes,
   * and manage account updates based on the current subscription state.
   *
   * @param {SubscriptionUpdatedCommand} command - The command containing the details of the subscription update.
   * @return {Promise<void>} - A promise that resolves upon successful execution.
   */
  @Transactional()
  async execute(command: SubscriptionUpdatedCommand): Promise<void> {
    this.cliLoggingService.log('START: SubscriptionUpdatedCommandHandler');
    try {
      const accountSubscription =
        await this.subscriptionRepository.getSubscriptionBySubscriptionId(
          command.subscriptionId,
        );
      if (!accountSubscription) {
        throw new BadRequestException('Account Subscription not found.');
      }
      const currentSubscription = await this.paddleService.getSubscription(
        command.subscriptionId,
      );
      if (currentSubscription.scheduledChange) {
        const status =
          await this.subscriptionStatusRepository.getSubscriptionStatusByName(
            SubscriptionStatusesEnum.canceled,
          );
        await this.subscriptionRepository.save({
          ...accountSubscription,
          status,
        });
        const customData = currentSubscription.customData as { id: IdType };
        const account = await this.accountRepository.getAccountWithSubscription(
          customData.id,
        );
        const billing = await this.billingResponseFactory.createResponse(
          account.subscription,
          {
            ownerEmail: account.owner.email,
            accountId: account.id,
          },
        );
        await this.gatewayService.handleUpdateBilling(customData.id, billing);
      } else {
        const customData = currentSubscription.customData as { id: IdType };
        if (currentSubscription.status === 'canceled') {
          const status =
            await this.subscriptionStatusRepository.getSubscriptionStatusByName(
              SubscriptionStatusesEnum.deactivated,
            );
          const account =
            await this.accountRepository.getAccountWithSubscription(
              customData.id,
            );
          await this.subscriptionRepository.save({
            ...account.subscription,
            status,
          });
          await this.gatewayService.handlePaymentMethodChange(
            account.id,
            null,
            null,
          );
        } else if (currentSubscription.status === 'past_due') {
          await this.accountLimitRepository.removeAccountLimits(customData.id);
          await this.paddleService.unsubscribeNow(command.subscriptionId);
        } else {
          const status =
            await this.subscriptionStatusRepository.getSubscriptionStatusByName(
              SubscriptionStatusesEnum.activated,
            );
          for (const item of currentSubscription.items) {
            const tariffPlanSetting =
              await this.tariffPlanSettingRepository.getTariffPlansByPaddleId(
                item.price.id,
              );
            if (!tariffPlanSetting) {
              throw new BadRequestException(
                `TariffPlanSetting by paddle price id not found.`,
              );
            }

            const account =
              await this.accountRepository.getAccountWithSubscription(
                customData.id,
              );
            await this.subscriptionRepository.save({
              ...account.subscription,
              subscriptionId: currentSubscription.id,
              customerId: currentSubscription.customerId,
              tariffPlanSetting,
              status,
              activationDate: item.previouslyBilledAt,
              statusUpdateDate: item.nextBilledAt,
            });
            if (
              accountSubscription.status.name !=
              SubscriptionStatusesEnum.updated
            ) {
              await this.accountLimitRepository.removeAccountLimits(
                customData.id,
              );
              const tariffPlanLimits =
                await this.defaultTariffPlanLimitRepository.getAllLimitsByTariffPlan(
                  tariffPlanSetting.tariffPlan.name,
                );
              await this.accountLimitRepository.save(
                tariffPlanLimits.map((limit) => {
                  return {
                    account: { id: customData.id },
                    accountLimitType: limit.limitType,
                    limit: limit.limit,
                  };
                }),
              );
              await this.gatewayService.handleUpdatedAllAccountLimits(
                customData.id,
              );
            }
          }
        }
      }
      this.cliLoggingService.log(`END: SubscriptionUpdatedCommandHandler`);
    } catch (error) {
      this.cliLoggingService.error(
        `SubscriptionUpdatedCommandHandler (${JSON.stringify(command)})`,
        error,
      );
    }
  }
}
