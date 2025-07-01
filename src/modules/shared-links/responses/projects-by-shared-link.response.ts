import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { ProjectBySharedLinkResponse } from 'modules/shared-links/responses/project-by-shared-link.response';

export class ProjectsBySharedLinkResponse extends WithPaginatedResponse(
  ProjectBySharedLinkResponse,
) {}
