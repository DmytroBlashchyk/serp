import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { ApiProjectResponse } from 'modules/api/response/api-project.response';

export class ApiProjectsResponse extends WithPaginatedResponse(
  ApiProjectResponse,
) {}
