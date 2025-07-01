import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export class TopResponse extends BaseResponse<TopResponse> {
  @ResponseProperty()
  count: number;

  @ResponseProperty()
  newCount: number;

  @ResponseProperty()
  lostCount: number;
}
