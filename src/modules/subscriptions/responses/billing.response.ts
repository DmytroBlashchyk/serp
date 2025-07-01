import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { CardResponse } from 'modules/subscriptions/responses/card.response';
import { SubscriptionStatusResponse } from 'modules/subscriptions/responses/subscription-status.response';
import { PaymentMethodResponse } from 'modules/payments/responses/payment-method.response';
import { TransactionStatusResponse } from 'modules/transactions/responses/transaction-status.response';

export class BillingResponse extends BaseResponse<BillingResponse> {
  @ResponseProperty()
  subscriptionId: string;

  @ResponseProperty()
  subscriptionExpirationDate: Date;

  @ResponseProperty({ cls: TariffPlanResponse })
  tariffPlan: TariffPlanResponse;

  @ResponseProperty()
  remainingNumberOfUpdates: number;

  @ResponseProperty({ cls: PaymentMethodResponse })
  paymentMethod: PaymentMethodResponse;

  @ResponseProperty()
  email: string;

  @ResponseProperty({ cls: CardResponse, nullable: true })
  card?: CardResponse;

  @ResponseProperty({ cls: SubscriptionStatusResponse })
  status: SubscriptionStatusResponse;

  @ResponseProperty({ cls: TransactionStatusResponse, nullable: true })
  lastTransactionStatus: TransactionStatusResponse;
}
