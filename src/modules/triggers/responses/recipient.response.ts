import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class RecipientResponse extends BaseResponse<RecipientResponse> {
  @ResponseProperty()
  email: string;

  @ResponseProperty()
  subscribed: boolean;
}
