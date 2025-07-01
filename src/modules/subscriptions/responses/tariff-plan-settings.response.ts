import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TariffPlanTypeResponse } from 'modules/subscriptions/responses/tariff-plan-type.response';
import { QuantityProperty } from 'modules/common/decorators/quantity-property.decorator';

export class TariffPlanSettingsResponse extends BaseResponse<TariffPlanSettingsResponse> {
  @IdProperty()
  id: IdType;

  @QuantityProperty()
  dailyWordCount: number;

  @QuantityProperty()
  monthlyWordCount: number;

  @ResponseProperty()
  price: number;

  @ResponseProperty()
  paddleProductId: string;

  @ResponseProperty({ cls: TariffPlanTypeResponse })
  type: TariffPlanTypeResponse;

  @ResponseProperty({ nullable: true })
  currentTariffPlan?: boolean;
}
