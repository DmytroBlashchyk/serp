import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { ProjectUrlTypeResponse } from 'modules/projects/responses/project-url-type.response';

export class ProjectUrlTypesResponse extends WithArrayResponse(
  ProjectUrlTypeResponse,
) {}
