import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortAlertKeywordsEnum } from 'modules/alerts/enums/sort-alert-keywords.enum';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';

export class GetAlertKeywordsRequest extends WithSorting(
  SortAlertKeywordsEnum,
  PaginatedQueryRequest,
) {}
