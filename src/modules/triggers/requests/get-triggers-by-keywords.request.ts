import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortTriggersByKeywordsEnum } from 'modules/triggers/enums/sort-triggers-by-keywords.enum';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';

export class GetTriggersByKeywordsRequest extends WithSorting(
  SortTriggersByKeywordsEnum,
  PaginatedQueryRequest,
) {}
