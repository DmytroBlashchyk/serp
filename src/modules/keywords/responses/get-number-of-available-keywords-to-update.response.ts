import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class GetNumberOfAvailableKeywordsToUpdateResponse extends BaseResponse<GetNumberOfAvailableKeywordsToUpdateResponse> {
  @ResponseProperty()
  keywordCount: number;
}
