import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class ImprovedVsDeclinedResponse extends BaseResponse<ImprovedVsDeclinedResponse> {
  @ResponseProperty()
  date: Date;

  @ResponseProperty()
  improved: number;

  @ResponseProperty()
  declined: number;

  @ResponseProperty()
  lost: number;

  @ResponseProperty()
  noChange: number;
}
