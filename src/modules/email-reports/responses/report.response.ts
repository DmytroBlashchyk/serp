import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { AvailableProjectResponse } from 'modules/projects/responses/available-project.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { RecipientResponse } from 'modules/email-reports/responses/recipient.response';
import { FrequencyResponse } from 'modules/email-reports/responses/frequency.response';
import { DeliveryTimeResponse } from 'modules/email-reports/responses/delivery-time.response';
import { FormatResponse } from 'modules/email-reports/responses/format.response';

export class ReportResponse extends BaseResponse<ReportResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ cls: AvailableProjectResponse })
  project: AvailableProjectResponse;

  @ResponseProperty({ cls: RecipientResponse, each: true })
  recipients: RecipientResponse[];

  @ResponseProperty({ cls: FrequencyResponse })
  frequency: FrequencyResponse;

  @ResponseProperty({ cls: DeliveryTimeResponse })
  deliveryTime: DeliveryTimeResponse;

  @ResponseProperty({ cls: FormatResponse })
  format: FormatResponse;
}
