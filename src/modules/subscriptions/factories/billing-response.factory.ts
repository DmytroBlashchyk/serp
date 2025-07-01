import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { BillingResponse } from 'modules/subscriptions/responses/billing.response';
import { Injectable } from '@nestjs/common';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { TariffPlanSettingsResponse } from 'modules/subscriptions/responses/tariff-plan-settings.response';
import { CardResponse } from 'modules/subscriptions/responses/card.response';
import { SubscriptionStatusResponse } from 'modules/subscriptions/responses/subscription-status.response';
import moment from 'moment';
import { SubscriptionEntity } from 'modules/subscriptions/entities/subscription.entity';
import { TariffPlanTypeResponse } from 'modules/subscriptions/responses/tariff-plan-type.response';
import { PaymentMethodResponse } from 'modules/payments/responses/payment-method.response';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { TransactionStatusResponse } from 'modules/transactions/responses/transaction-status.response';

@Injectable()
export class BillingResponseFactory extends BaseResponseFactory<
  SubscriptionEntity,
  BillingResponse
> {
  constructor(private readonly transactionRepository: TransactionRepository) {
    super();
  }
  /**
   * Creates a response object based on the provided subscription entity and optional parameters.
   *
   * @param {SubscriptionEntity} entity - The subscription entity containing data about the subscription.
   * @param {Object} [options] - Optional parameters for the response.
   * @param {string} options.ownerEmail - The email of the owner.
   * @param {IdType} options.accountId - The account ID.
   * @return {Promise<BillingResponse>} A promise that resolves to a BillingResponse object containing the response details.
   */
  async createResponse(
    entity: SubscriptionEntity,
    options?: { ownerEmail: string; accountId: IdType },
  ): Promise<BillingResponse> {
    const ownerEmail = options.ownerEmail as string;
    const accountId = options.accountId as IdType;
    const lastTransaction =
      await this.transactionRepository.retrieveLastTransactionOfAccount(
        accountId,
      );

    return new BillingResponse({
      subscriptionId: entity.subscriptionId,
      status: new SubscriptionStatusResponse({
        id: entity.status.id,
        name: entity.status.name,
      }),
      subscriptionExpirationDate: entity.statusUpdateDate
        ? moment(entity.statusUpdateDate).format('MMM, D YYYY')
        : null,
      tariffPlan: new TariffPlanResponse({
        id: entity.tariffPlanSetting.tariffPlan.id,
        name: entity.tariffPlanSetting.tariffPlan.name,
        settings: new TariffPlanSettingsResponse({
          id: entity.tariffPlanSetting.id,
          price: entity.tariffPlanSetting.price,
          paddleProductId: entity.tariffPlanSetting.paddleProductId,
          type: new TariffPlanTypeResponse({
            id: entity.tariffPlanSetting.type.id,
            name: entity.tariffPlanSetting.type.name,
          }),
        }),
      }),
      paymentMethod: new PaymentMethodResponse({ ...entity.paymentMethod }),
      email: ownerEmail,
      card: entity.card
        ? new CardResponse({
            id: entity.card.id,
            last4: +entity.card.last4,
            expiry: `${entity.card.expiryMonth}/${entity.card.expiryYear}`,
            type: entity.card.type,
          })
        : null,
      lastTransactionStatus: lastTransaction
        ? new TransactionStatusResponse({
            ...lastTransaction.status,
          })
        : null,
    });
  }
}
