import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { TriggerKeywordResponse } from 'modules/triggers/responses/trigger-keyword.response';

export class TriggerKeywordsResponse extends WithPaginatedResponse(
  TriggerKeywordResponse,
) {}
