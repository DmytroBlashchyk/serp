import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { ProjectWithAlertsResponse } from 'modules/alerts/responses/project-with-alerts.response';

export class ProjectsWithAlertsResponse extends WithArrayResponse(
  ProjectWithAlertsResponse,
) {}
