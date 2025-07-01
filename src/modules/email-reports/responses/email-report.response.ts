import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { FrequencyResponse } from 'modules/email-reports/responses/frequency.response';
import { FormatResponse } from 'modules/email-reports/responses/format.response';

export class EmailReportResponse extends BaseResponse<EmailReportResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  recipient: string;

  @ResponseProperty()
  project: string;

  @ResponseProperty({ cls: FrequencyResponse })
  frequency: FrequencyResponse;

  @ResponseProperty()
  lastSent: string;

  @ResponseProperty()
  lastSentFullFormat: string;

  @ResponseProperty()
  nextDelivery: Date;

  @ResponseProperty({ cls: FormatResponse })
  format: FormatResponse;
}
