import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class StatusResponse extends BaseResponse<StatusResponse> {
  @ResponseProperty()
  status: boolean;
}
