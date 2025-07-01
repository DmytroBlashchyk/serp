import { DailyAveragePositionsResponse } from 'modules/keywords/responses/daily-average-positions.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';
import { NotesResponse } from 'modules/keywords/responses/notes.response';
import { CompetitorsProjectPerformanceResponse } from 'modules/competitors/responses/competitors-project-performance.response';

export class ProjectPerformanceResponse extends BaseResponse<ProjectPerformanceResponse> {
  @ResponseProperty({ cls: DailyAveragePositionsResponse })
  dailyAveragePosition: DailyAveragePositionsResponse;

  @ResponseProperty({ cls: NotesResponse })
  notes: NotesResponse;

  @ResponseProperty({ cls: CompetitorsProjectPerformanceResponse })
  competitorsProjectPerformance: CompetitorsProjectPerformanceResponse;
}
