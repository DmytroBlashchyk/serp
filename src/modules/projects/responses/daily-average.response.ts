import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class DailyAverageResponse extends BaseResponse<DailyAverageResponse> {
  @ResponseProperty()
  date: Date;

  @ResponseProperty()
  avg: number;
}
