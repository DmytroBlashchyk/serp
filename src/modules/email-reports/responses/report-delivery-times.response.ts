import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { DeliveryTimeResponse } from 'modules/email-reports/responses/delivery-time.response';

export class ReportDeliveryTimesResponse extends WithArrayResponse(
  DeliveryTimeResponse,
) {}
