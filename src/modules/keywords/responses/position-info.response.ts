import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class PositionInfoResponse extends BaseResponse<PositionInfoResponse> {
  @ResponseProperty()
  difference: number;

  @ResponseProperty()
  lastPositionDate: string;

  @ResponseProperty()
  lastPosition: number;

  @ResponseProperty()
  periodPosition: number;

  @ResponseProperty()
  positionDateForPeriod: string;

  @ResponseProperty()
  isImproved: boolean;

  @ResponseProperty()
  isDeclined: boolean;
}
