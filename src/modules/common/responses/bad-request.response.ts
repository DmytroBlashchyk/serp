import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class BadRequestResponse extends BaseResponse {
  @ResponseProperty()
  statusCode: number;

  @ResponseProperty()
  message: string;

  @ResponseProperty()
  error: string;
}
