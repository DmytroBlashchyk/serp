import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class ApiAccessResponse extends BaseResponse<ApiAccessResponse> {
  @ResponseProperty()
  apiKey: string;

  @ResponseProperty()
  apiEndpoints: string;

  @ResponseProperty()
  apiCredits: number;
}
