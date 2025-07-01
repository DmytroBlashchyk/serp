import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { KeywordTrendResponse } from 'modules/projects/responses/keyword-trend.response';

export class KeywordTrendsResponse extends WithArrayResponse(
  KeywordTrendResponse,
) {}
