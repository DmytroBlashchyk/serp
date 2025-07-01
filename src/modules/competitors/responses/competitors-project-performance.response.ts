import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { CompetitorProjectPerformanceResponse } from 'modules/competitors/responses/competitor-project-performance.response';

export class CompetitorsProjectPerformanceResponse extends WithArrayResponse(
  CompetitorProjectPerformanceResponse,
) {}
