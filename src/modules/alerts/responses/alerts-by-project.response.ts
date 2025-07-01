import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { AlertByProjectResponse } from 'modules/alerts/responses/alert-by-project.response';

export class AlertsByProjectResponse extends WithPaginatedResponse(
  AlertByProjectResponse,
) {}
