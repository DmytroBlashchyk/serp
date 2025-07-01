import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TariffPlanSettingsResponse } from 'modules/subscriptions/responses/tariff-plan-settings.response';

export class TariffPlanResponse extends BaseResponse<TariffPlanResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ enum: TariffPlansEnum })
  name: TariffPlansEnum;

  @ResponseProperty({ cls: TariffPlanSettingsResponse })
  settings: TariffPlanSettingsResponse;
}
