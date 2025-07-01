import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class KeywordPositionInfoResponse extends BaseResponse<KeywordPositionInfoResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  date: string;

  @ResponseProperty()
  dateFullFormat: string;

  @ResponseProperty()
  position: number;

  @ResponseProperty({ nullable: true })
  foundUrl?: string;
}
