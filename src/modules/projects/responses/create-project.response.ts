import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';

export class CreateProjectResponse extends BaseResponse<CreateProjectResponse> {
  @IdProperty()
  projectId: IdType;

  @ResponseProperty()
  duplicateKeywordsWereMissed: boolean;

  @ResponseProperty()
  keywordUpdateWasSkipped: boolean;
}
