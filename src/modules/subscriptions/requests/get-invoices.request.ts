import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortInvoiceEnum } from 'modules/subscriptions/enums/sort-invoice.enum';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';

export class GetInvoicesRequest extends WithSorting(
  SortInvoiceEnum,
  PaginatedQueryRequest,
) {}
