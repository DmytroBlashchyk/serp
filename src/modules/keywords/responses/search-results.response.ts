import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { SearchResultResponse } from 'modules/keywords/responses/search-result.response';

export class SearchResultsResponse extends WithPaginatedResponse(
  SearchResultResponse,
) {}
