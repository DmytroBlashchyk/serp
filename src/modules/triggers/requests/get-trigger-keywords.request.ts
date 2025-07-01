import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortTriggerKeywordsEnum } from 'modules/triggers/enums/sort-trigger-keywords.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';

export class GetTriggerKeywordsRequest extends WithSorting(
  SortTriggerKeywordsEnum,
  PaginatedSearchRequest,
) {}
