import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class CheckoutSettingsResponse extends BaseResponse<CheckoutSettingsResponse> {
  @ResponseProperty()
  data: string;
}
