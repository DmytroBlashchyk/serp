import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { TransactionCompletedCommand } from 'modules/payments/commands/transaction-completed.command';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { CardRepository } from 'modules/transactions/repositories/card.repository';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { NotFoundException } from '@nestjs/common';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { PaymentMethodRepository } from 'modules/payments/repositories/payment-method.repository';
import { PaymentMethodsEnum } from 'modules/payments/enums/payment-methods.enum';

@CommandHandler(TransactionCompletedCommand)
export class TransactionCompletedCommandHandler
  implements ICommandHandler<TransactionCompletedCommand>
{
  constructor(
    private readonly transactionStatusRepository: TransactionStatusRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly cardRepository: CardRepository,
    private readonly paddleService: PaddleService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly subscriptionStatusRepository: SubscriptionStatusRepository,
    private readonly accountLimitRepository: AccountLimitRepository,
    private readonly defaultTariffPlanLimitRepository: DefaultTariffPlanLimitRepository,
    private readonly gatewayService: GatewayService,
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}
  /**
   * Handles the execution of transaction completion logic by performing a series
   * of operations including fetching transaction details, updating subscription
   * information, and managing payment methods.
   *
   * @param {TransactionCompletedCommand} command - The command containing the transaction details needed for handling.
   * @return {Promise<void>} A promise that resolves when the transaction completion process is successfully completed.
   */
  @Transactional()
  async execute(command: TransactionCompletedCommand): Promise<void> {
    this.cliLoggingService.log(`START: TransactionCompletedCommandHandler`);
    try {
      const transactionInfo = await this.paddleService.getTransaction(
        command.transactionId,
      );
      const subscription = await this.paddleService.getSubscription(
        transactionInfo.subscriptionId,
      );
      const currentSubscription =
        await this.subscriptionRepository.getSubscriptionBySubscriptionId(
          transactionInfo.subscriptionId,
        );
      if (!currentSubscription) {
        throw new NotFoundException('Current Subscription not found.');
      }
      if (transactionInfo.payments.length > 0) {
        const cardPayload = transactionInfo.payments[0].methodDetails.card;
        const type = transactionInfo.payments[0].methodDetails
          .type as PaymentMethodsEnum;
        const paymentMethod =
          await this.paymentMethodRepository.getPaymentMethodByName(type);
        if (cardPayload) {
          const card = await this.cardRepository.save({
            type: cardPayload.type,
            last4: cardPayload.last4,
            expiryMonth: cardPayload.expiryMonth,
            expiryYear: cardPayload.expiryYear,
          });
          await this.subscriptionRepository.save({
            ...currentSubscription,
            card,
            paymentMethod,
          });
        } else {
          await this.subscriptionRepository.save({
            ...currentSubscription,
            paymentMethod,
            card: null,
          });
        }

        const customData = subscription.customData as { id: IdType };
        await this.gatewayService.handlePaymentMethodChange(
          customData.id,
          cardPayload
            ? {
                type: cardPayload.type,
                last4: cardPayload.last4.toString(),
                expiryYear: cardPayload.expiryYear.toString(),
                expiryMonth: cardPayload.expiryMonth.toString(),
              }
            : null,
          paymentMethod,
        );
      }
      if (
        currentSubscription.status.name === SubscriptionStatusesEnum.updated
      ) {
        const subscriptionStatus =
          await this.subscriptionStatusRepository.getSubscriptionStatusByName(
            SubscriptionStatusesEnum.activated,
          );
        await this.subscriptionRepository.save({
          ...currentSubscription,
          status: subscriptionStatus,
          statusUpdateDate: transactionInfo.billingPeriod.endsAt,
        });
        const customData = subscription.customData as { id: IdType };
        await this.accountLimitRepository.removeAccountLimits(customData.id);
        const tariffPlanLimits =
          await this.defaultTariffPlanLimitRepository.getAllLimitsByTariffPlan(
            currentSubscription.tariffPlanSetting.tariffPlan.name,
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
        await this.gatewayService.handleUpdatedAllAccountLimits(customData.id);

        const transaction =
          await this.transactionRepository.getTransactionByTransactionId(
            command.transactionId,
          );
        const transactionStatus =
          await this.transactionStatusRepository.getStatusByName(
            transactionInfo.origin === 'subscription_payment_method_change'
              ? TransactionStatusesEnum.subscriptionPaymentMethodChange
              : TransactionStatusesEnum.completed,
          );

        await this.transactionRepository.save({
          ...transaction,
          status: transactionStatus,
          amount: Number(transactionInfo.payments[0].amount) / 100,
          tariffPlanSetting: currentSubscription.tariffPlanSetting,
          subscriptionId: transactionInfo.subscriptionId,
        });
      }

      const transaction =
        await this.transactionRepository.getTransactionByTransactionId(
          command.transactionId,
        );
      if (subscription.items[0]?.price?.productId) {
        const tariffPlanSetting =
          await this.tariffPlanSettingRepository.getTariffPlansByPaddleId(
            subscription.items[0]?.price.id,
          );
        if (transactionInfo.payments.length > 0) {
          const transactionStatus =
            await this.transactionStatusRepository.getStatusByName(
              TransactionStatusesEnum.completed,
            );
          await this.transactionRepository.save({
            ...transaction,
            status: transactionStatus,
            amount: Number(transactionInfo.payments[0].amount) / 100,
            tariffPlanSetting: tariffPlanSetting,
          });
        }
      }
      this.cliLoggingService.log(`START: TransactionCompletedCommandHandler`);
    } catch (error) {
      this.cliLoggingService.error(
        `TransactionCompletedCommandHandler ${JSON.stringify(command)}`,
        error,
      );
    }
  }
}
