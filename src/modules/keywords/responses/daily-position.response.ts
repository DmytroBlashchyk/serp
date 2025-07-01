import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { PositionInfoResponse } from 'modules/keywords/responses/position-info.response';

export class DailyPositionResponse extends BaseResponse<DailyPositionResponse> {
  @ResponseProperty()
  isImproved: boolean;

  @ResponseProperty()
  isDeclined: boolean;

  @ResponseProperty()
  dash: boolean;

  @ResponseProperty()
  changes: number;

  @ResponseProperty({ cls: PositionInfoResponse })
  positionInfo: PositionInfoResponse;
}
