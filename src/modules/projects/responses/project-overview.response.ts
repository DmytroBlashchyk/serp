import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TopResponse } from 'modules/projects/responses/top.response';
import { AveragePositionResponse } from 'modules/projects/responses/average-position.response';

export class ProjectOverviewResponse extends BaseResponse<ProjectOverviewResponse> {
  @ResponseProperty()
  improved: number;

  @ResponseProperty()
  declined: number;

  @ResponseProperty()
  noChange: number;

  @ResponseProperty()
  lost: number;

  @ResponseProperty({ cls: TopResponse })
  top3: TopResponse;

  @ResponseProperty({ cls: TopResponse })
  top10: TopResponse;

  @ResponseProperty({ cls: TopResponse })
  top30: TopResponse;

  @ResponseProperty()
  top100: TopResponse;

  @ResponseProperty({ cls: AveragePositionResponse })
  avgPos: AveragePositionResponse;

  @ResponseProperty()
  fromDate: string;

  @ResponseProperty()
  toDate: string;

  @ResponseProperty()
  lastUpdate: string;

  @ResponseProperty()
  lastUpdateFullFormat: string;
}
