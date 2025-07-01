import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { CardResponse } from 'modules/subscriptions/responses/card.response';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { PaymentMethodResponse } from 'modules/payments/responses/payment-method.response';

export class SubscriptionSummaryResponse extends BaseResponse<SubscriptionSummaryResponse> {
  @ResponseProperty({ cls: TariffPlanResponse })
  product: TariffPlanResponse;

  @ResponseProperty()
  quantity: number;

  @ResponseProperty({ cls: PaymentMethodResponse })
  paymentMethod: PaymentMethodResponse;

  @ResponseProperty()
  email: string;

  @ResponseProperty()
  card: CardResponse;
}
