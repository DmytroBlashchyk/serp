import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class VisitorRequestsLimitResponse extends BaseResponse<VisitorRequestsLimitResponse> {
  @ResponseProperty({ nullable: true })
  freeRequestsLimit: number;
}
