import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { SortSharedLinksEnum } from 'modules/shared-links/enums/sort-shared-links.enum';

export class GetAllSharedLinksRequest extends WithSorting(
  SortSharedLinksEnum,
  PaginatedSearchRequest,
) {}
