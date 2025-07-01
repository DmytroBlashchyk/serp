import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BaseResponse } from 'modules/common/responses/base.response';

export class UpdateKeywordPositionResponse extends BaseResponse<UpdateKeywordPositionResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  position: number;

  @ResponseProperty()
  url: string;

  @ResponseProperty()
  updated: string;
}
