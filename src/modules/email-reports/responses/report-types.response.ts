import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { FormatResponse } from 'modules/email-reports/responses/format.response';

export class ReportTypesResponse extends WithArrayResponse(FormatResponse) {}
