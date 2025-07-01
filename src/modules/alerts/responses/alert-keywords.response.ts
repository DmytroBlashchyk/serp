import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { AlertKeywordResponse } from 'modules/alerts/responses/alert-keyword.response';

export class AlertKeywordsResponse extends WithPaginatedResponse(
  AlertKeywordResponse,
) {}
