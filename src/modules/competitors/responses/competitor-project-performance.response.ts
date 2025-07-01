import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { DailyAveragePositionsResponse } from 'modules/keywords/responses/daily-average-positions.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class CompetitorProjectPerformanceResponse extends DailyAveragePositionsResponse {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ nullable: true })
  domainName?: string;

  @ResponseProperty({ nullable: true })
  businessName?: string;

  @ResponseProperty({ nullable: true })
  url?: string;
}
