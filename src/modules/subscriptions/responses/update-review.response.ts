import { SubscriptionSummaryResponse } from 'modules/subscriptions/responses/subscription-summary.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { ImmediatePaymentResponse } from 'modules/subscriptions/responses/immediate-payment.response';
import { BaseResponse } from 'modules/common/responses/base.response';
import { NextPaymentResponse } from 'modules/subscriptions/responses/next-payment.response';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';

export class UpdateReviewResponse extends BaseResponse<UpdateReviewResponse> {
  @ResponseProperty({ cls: SubscriptionSummaryResponse })
  subscriptionSummary: SubscriptionSummaryResponse;

  @ResponseProperty({ cls: ImmediatePaymentResponse })
  immediatePayment: ImmediatePaymentResponse;

  @ResponseProperty({ cls: NextPaymentResponse })
  nextPayment: NextPaymentResponse;

  @ResponseProperty({ cls: TariffPlanResponse })
  currentTariffPlan: TariffPlanResponse;
}
