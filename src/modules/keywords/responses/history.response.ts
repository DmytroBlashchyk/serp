import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class HistoryResponse extends BaseResponse<HistoryResponse> {
  @ResponseProperty()
  date: Date;

  @ResponseProperty()
  position: number;
}
