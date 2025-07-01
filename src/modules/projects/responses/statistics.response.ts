import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { AveragePositionResponse } from 'modules/projects/responses/average-position.response';

export class StatisticsResponse extends BaseResponse<StatisticsResponse> {
  @ResponseProperty()
  improved: number;

  @ResponseProperty()
  declined: number;

  @ResponseProperty()
  noChange: number;

  @ResponseProperty({ cls: AveragePositionResponse })
  avgPos: AveragePositionResponse;
}
