import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export class SearchResultResponse extends BaseResponse<SearchResultResponse> {
  @ResponseProperty()
  position: number;

  @ResponseProperty()
  url: string;

  @ResponseProperty()
  keywordPosition: boolean;
}
