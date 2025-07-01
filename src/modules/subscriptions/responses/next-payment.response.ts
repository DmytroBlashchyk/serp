import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class NextPaymentResponse extends BaseResponse<NextPaymentResponse> {
  @ResponseProperty()
  total: number;

  @ResponseProperty()
  currencyCode: string;

  @ResponseProperty()
  date: Date;
}
