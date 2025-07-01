import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { AlertByKeywordResponse } from 'modules/alerts/responses/alert-by-keyword.response';

export class AlertsByKeywordsResponse extends WithPaginatedResponse(
  AlertByKeywordResponse,
) {}
