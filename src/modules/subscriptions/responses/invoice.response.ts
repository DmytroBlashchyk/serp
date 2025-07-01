import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';

export class InvoiceResponse extends BaseResponse<InvoiceResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  billingDate: string;

  @ResponseProperty()
  billingDateFullFormat: string;

  @ResponseProperty({ cls: TariffPlanResponse })
  plan: TariffPlanResponse;

  @ResponseProperty()
  amount: number;

  @ResponseProperty()
  transactionId: string;
}
