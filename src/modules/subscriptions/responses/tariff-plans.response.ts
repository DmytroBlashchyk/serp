import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';

export class TariffPlansResponse extends WithArrayResponse(
  TariffPlanResponse,
) {}
