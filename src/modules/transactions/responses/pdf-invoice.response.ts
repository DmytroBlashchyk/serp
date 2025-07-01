import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class PdfInvoiceResponse extends BaseResponse<PdfInvoiceResponse> {
  @ResponseProperty()
  url: string;
}
