import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { ProjectKeywordRequest } from 'modules/projects/responses/project-keyword.request';

export class GetProjectKeywordsResponse extends WithPaginatedResponse(
  ProjectKeywordRequest,
) {}
