import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { PositionInfoResponse } from 'modules/keywords/responses/position-info.response';

export class LifeResponse extends BaseResponse<LifeResponse> {
  @ResponseProperty()
  isImproved: boolean;

  @ResponseProperty()
  isDeclined: boolean;

  @ResponseProperty()
  changes: number;

  @ResponseProperty()
  dash: boolean;

  @ResponseProperty()
  positionInfo: PositionInfoResponse;
}
