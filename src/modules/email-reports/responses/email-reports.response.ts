import { WithPaginatedResponse } from 'modules/common/mixins/with-pagination.mixin';
import { EmailReportResponse } from 'modules/email-reports/responses/email-report.response';

export class EmailReportsResponse extends WithPaginatedResponse(
  EmailReportResponse,
) {}
