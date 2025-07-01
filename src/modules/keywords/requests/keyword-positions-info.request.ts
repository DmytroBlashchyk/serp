import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortKeywordPositionsEnum } from 'modules/keywords/enums/sort-keyword-positions.enum';

export class KeywordPositionsInfoRequest extends WithSorting(
  SortKeywordPositionsEnum,
  PaginatedQueryRequest,
) {}
