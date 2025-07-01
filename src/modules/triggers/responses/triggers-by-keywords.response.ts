import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { TriggerByKeywordResponse } from 'modules/triggers/responses/trigger-by-keyword.response';

export class TriggersByKeywordsResponse extends WithPaginatedResponse(
  TriggerByKeywordResponse,
) {}
