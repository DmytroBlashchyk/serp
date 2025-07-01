import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortingEmailReportsEnum } from 'modules/email-reports/enums/sorting-email-reports.enum';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';

export class EmailReportsRequest extends WithSorting(
  SortingEmailReportsEnum,
  PaginatedSearchRequest,
) {}
