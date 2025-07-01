import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class AvgItemResponse extends BaseResponse<AvgItemResponse> {
  @ResponseProperty()
  avg: number;
}
