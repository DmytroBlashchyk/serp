import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { TriggerByProjectResponse } from 'modules/triggers/responses/trigger-by-project.response';

export class TriggersByProjectResponse extends WithPaginatedResponse(
  TriggerByProjectResponse,
) {}
