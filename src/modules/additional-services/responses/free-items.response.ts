import { WithArrayResponse } from 'modules/common/mixins/with-array-response.mixin';
import { FreeResponse } from 'modules/additional-services/responses/free.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export class FreeItemsResponse extends BaseResponse<FreeItemsResponse> {
  @ResponseProperty({ each: true, cls: FreeResponse })
  readonly items: FreeResponse[];

  @ResponseProperty({ nullable: true })
  freeRequestsLimit: number;
}
