import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { ImmediatePaymentActionsEnum } from 'modules/subscriptions/enums/immediate-payment-actions.enum';

export class ImmediatePaymentResponse extends BaseResponse<ImmediatePaymentResponse> {
  @ResponseProperty()
  updateSummaryAmount: number;

  @ResponseProperty()
  currencyCode: string;

  @ResponseProperty()
  startsAt: Date;

  @ResponseProperty()
  action: 'credit' | 'charge';
}
