import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TransactionUpdatedCommand } from 'modules/payments/commands/transaction-updated.command';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { PaddleService } from 'modules/payments/services/paddle.service';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { PaymentMethodRepository } from 'modules/payments/repositories/payment-method.repository';
import { PaymentMethodsEnum } from 'modules/payments/enums/payment-methods.enum';
import { CardRepository } from 'modules/transactions/repositories/card.repository';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { IdType } from 'modules/common/types/id-type.type';
import { BillingResponseFactory } from 'modules/subscriptions/factories/billing-response.factory';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';

@CommandHandler(TransactionUpdatedCommand)
export class TransactionUpdatedCommandHandler
  implements ICommandHandler<TransactionUpdatedCommand>
{
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly transactionStatusRepository: TransactionStatusRepository,
    private readonly cliLoggingService: CliLoggingService,
    private readonly paddleService: PaddleService,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly cardRepository: CardRepository,
    private readonly gatewayService: GatewayService,
    private readonly billingResponseFactory: BillingResponseFactory,
    private readonly accountRepository: AccountRepository,
  ) {}
  /**
   * Executes the TransactionUpdatedCommand, updating the respective transaction and subscription details.
   *
   * @param {TransactionUpdatedCommand} command - The command containing transaction update information.
   * @return {Promise<void>} A promise that resolves when the execution is complete.
   */
  @Transactional()
  async execute(command: TransactionUpdatedCommand): Promise<void> {
    this.cliLoggingService.log(`START: TransactionUpdatedCommandHandler`);
    try {
      const transactionInfo = await this.paddleService.getTransaction(
        command.transactionId,
      );
      if (transactionInfo.subscriptionId) {
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
        const currentSubscription = await this.paddleService.getSubscription(
          transactionInfo.subscriptionId,
        );
        for (const item of currentSubscription.items) {
          const tariffPlanSetting =
            await this.tariffPlanSettingRepository.getTariffPlansByPaddleId(
              item.price.id,
            );
          if (transactionInfo.payments.length > 0) {
            if (transactionInfo.payments[0].status === 'error') {
              const transactionStatus =
                await this.transactionStatusRepository.getStatusByName(
                  TransactionStatusesEnum.paymentFailed,
                );
              await this.transactionRepository.save({
                id: transaction.id,
                status: transactionStatus,
                amount: Number(transactionInfo.payments[0].amount) / 100,
                tariffPlanSetting,
                subscriptionId: transactionInfo.subscriptionId,
              });
            } else {
              await this.transactionRepository.save({
                id: transaction.id,
                status: transactionStatus,
                amount: Number(transactionInfo.payments[0].amount) / 100,
                tariffPlanSetting,
                subscriptionId: transactionInfo.subscriptionId,
              });
              const accountSubscription =
                await this.subscriptionRepository.getSubscriptionBySubscriptionId(
                  transactionInfo.subscriptionId,
                );
              if (accountSubscription) {
                const methodDetails = transactionInfo.payments[0].methodDetails;

                const paymentMethodType =
                  methodDetails.type as PaymentMethodsEnum;
                const paymentMethod =
                  await this.paymentMethodRepository.getPaymentMethodByName(
                    paymentMethodType,
                  );
                let card = null;
                if (paymentMethod.name === PaymentMethodsEnum.card) {
                  card = await this.cardRepository.save({
                    type: methodDetails.card.type,
                    last4: methodDetails.card.last4,
                    expiryMonth: methodDetails.card.expiryMonth,
                    expiryYear: methodDetails.card.expiryYear,
                  });
                }
                await this.subscriptionRepository.save({
                  ...accountSubscription,
                  paymentMethod,
                  card,
                });
                const customData = transactionInfo.customData as { id: IdType };
                await this.gatewayService.handlePaymentMethodChange(
                  customData.id,
                  card
                    ? {
                        type: card.type,
                        last4: card.last4,
                        expiryYear: card.expiryYear.toString(),
                        expiryMonth: card.expiryMonth.toString(),
                      }
                    : null,
                  paymentMethod,
                );
              }
            }
          } else {
            await this.transactionRepository.save({
              id: transaction.id,
              status: transactionStatus,
              amount: 0,
              tariffPlanSetting,
              subscription_id: transactionInfo.subscriptionId,
            });
          }
          const customData = currentSubscription.customData as {
            id: IdType;
          };
          const account =
            await this.accountRepository.getAccountWithSubscription(
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
        }
      }
      this.cliLoggingService.log(`END: TransactionUpdatedCommandHandler`);
    } catch (error) {
      this.cliLoggingService.error(
        `TransactionUpdatedCommandHandler ${JSON.stringify(command)}`,
        error,
      );
    }
  }
}
