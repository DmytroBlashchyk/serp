import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { AvailableProjectResponse } from 'modules/projects/responses/available-project.response';

export class ListAvailableProjectsResponse extends WithArrayResponse(
  AvailableProjectResponse,
) {}
