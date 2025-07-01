import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class ResendingForgotPasswordLetterResponse extends BaseResponse<ResendingForgotPasswordLetterResponse> {
  @ResponseProperty()
  status: boolean;
}
