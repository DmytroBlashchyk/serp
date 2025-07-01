import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class Top100Response extends BaseResponse<Top100Response> {
  @ResponseProperty()
  url: string;

  @ResponseProperty()
  position: number;

  @ResponseProperty()
  keywordPosition: boolean;
}
