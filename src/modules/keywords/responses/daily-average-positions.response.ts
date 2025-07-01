import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { DailyAveragePositionResponse } from 'modules/keywords/responses/daily-average-position.response';

export class DailyAveragePositionsResponse extends WithArrayResponse(
  DailyAveragePositionResponse,
) {}
