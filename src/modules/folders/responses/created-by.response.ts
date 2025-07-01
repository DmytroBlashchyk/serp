import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class CreatedByResponse extends BaseResponse<CreatedByResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty({ nullable: true })
  firstName?: string;

  @ResponseProperty({ nullable: true })
  lastName?: string;
}
