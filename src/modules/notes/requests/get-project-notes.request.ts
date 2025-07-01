import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortNotesEnum } from 'modules/notes/enums/sort-notes.enum';

export class GetProjectNotesRequest extends WithSorting(
  SortNotesEnum,
  PaginatedSearchRequest,
) {}
