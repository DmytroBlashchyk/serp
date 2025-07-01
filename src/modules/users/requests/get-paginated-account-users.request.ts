import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortUsersEnum } from 'modules/users/enums/sort-users.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';

export class GetPaginatedAccountUsersRequest extends WithSorting(
  SortUsersEnum,
  PaginatedSearchRequest,
) {}
