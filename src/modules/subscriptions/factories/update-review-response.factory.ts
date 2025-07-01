import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { UpdateReviewResponse } from 'modules/subscriptions/responses/update-review.response';
import { Injectable } from '@nestjs/common';
import { SubscriptionSummaryResponse } from 'modules/subscriptions/responses/subscription-summary.response';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { TariffPlanSettingsResponse } from 'modules/subscriptions/responses/tariff-plan-settings.response';
import { CardResponse } from 'modules/subscriptions/responses/card.response';
import { ImmediatePaymentResponse } from 'modules/subscriptions/responses/immediate-payment.response';
import moment from 'moment';
import { NextPaymentResponse } from 'modules/subscriptions/responses/next-payment.response';
import { SubscriptionPreview } from '@paddle/paddle-node-sdk';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';
import { PaymentMethodResponse } from 'modules/payments/responses/payment-method.response';

@Injectable()
export class UpdateReviewResponseFactory extends BaseResponseFactory<
  SubscriptionPreview,
  UpdateReviewResponse
> {
  /**
   * Creates a response object for a subscription preview, incorporating various options and entities.
   *
   * @param {SubscriptionPreview} entity - The subscription preview entity.
   * @param {Record<string, unknown>} [options] - Optional settings and entities, such as account and tariff plan setting.
   * @param {AccountEntity} [options.account] - Account entity, if provided.
   * @param {TariffPlanSettingEntity} [options.tariffPlanSetting] - Tariff plan setting entity, if provided.
   * @returns {Promise<UpdateReviewResponse>} The constructed update review response.
   */
  async createResponse(
    entity: SubscriptionPreview,
    options?: Record<string, unknown>,
  ): Promise<UpdateReviewResponse> {
    const account = options.account as AccountEntity;
    const tariffPlanSetting =
      options.tariffPlanSetting as TariffPlanSettingEntity;
    return new UpdateReviewResponse({
      subscriptionSummary: new SubscriptionSummaryResponse({
        product: new TariffPlanResponse({
          id: tariffPlanSetting.tariffPlan.id,
          name: tariffPlanSetting.tariffPlan.name,
          settings: new TariffPlanSettingsResponse({
            ...tariffPlanSetting,
            dailyWordCount:
              tariffPlanSetting.tariffPlan.defaultTariffPlanLimits.find(
                (item) =>
                  item.limitType.name ===
                  LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
              )?.limit ?? 0,
            monthlyWordCount:
              tariffPlanSetting.tariffPlan.defaultTariffPlanLimits.find(
                (item) =>
                  item.limitType.name ===
                  LimitTypesEnum.NumberOfMonthlyUpdatesOfKeywordPositions,
              )?.limit ?? 0,
          }),
        }),
        quantity: 1,
        paymentMethod: new PaymentMethodResponse({
          ...account.subscription.paymentMethod,
        }),
        email: account.owner.email,
        card: account.subscription.card
          ? new CardResponse({
              id: account.subscription.card?.id,
              last4: +account.subscription.card?.last4,
              expiry: `${account.subscription.card?.expiryMonth}/${account.subscription.card?.expiryYear}`,
              type: account.subscription.card?.type,
            })
          : null,
      }),
      immediatePayment: new ImmediatePaymentResponse({
        updateSummaryAmount: entity.updateSummary
          ? Number(entity.updateSummary.result.amount) / 100
          : 0,
        currencyCode: entity.updateSummary
          ? entity.updateSummary.result.currencyCode
          : '',
        action: entity.updateSummary
          ? entity.updateSummary.result.action
          : 'charge',
        startsAt: entity.immediateTransaction
          ? moment(entity.immediateTransaction.billingPeriod.startsAt).format(
              'MMM, D YYYY',
            )
          : '',
      }),
      nextPayment: new NextPaymentResponse({
        total:
          Number(entity.recurringTransactionDetails.totals.grandTotal) / 100,
        currencyCode: entity.recurringTransactionDetails.totals.currencyCode,
        date: moment(entity.nextTransaction.billingPeriod.startsAt).format(
          'MMM, D YYYY',
        ),
      }),
      currentTariffPlan: new TariffPlanResponse({
        ...account.subscription.tariffPlanSetting.tariffPlan,
        settings: account.subscription.tariffPlanSetting,
      }),
    });
  }
}
