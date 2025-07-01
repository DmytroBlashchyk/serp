import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { ProjectAvailableToUserResponse } from 'modules/projects/responses/project-available-to-user.response';

export class PaginatedProjectAvailableToUserResponse extends WithPaginatedResponse(
  ProjectAvailableToUserResponse,
) {}
