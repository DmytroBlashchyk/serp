import { WithSorting } from 'modules/common/mixins/with-sorting.mixin';
import { SortTriggersByProjectEnum } from 'modules/triggers/enums/sort-triggers-by-project.enum';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';

export class GeTriggersByProjectRequest extends WithSorting(
  SortTriggersByProjectEnum,
  PaginatedQueryRequest,
) {}
