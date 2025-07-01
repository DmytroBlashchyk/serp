import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class FolderProjectResponse extends BaseResponse<FolderProjectResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  projectName: string;

  @ResponseProperty({ nullable: true })
  favicon?: string;

  @ResponseProperty()
  available: boolean;
}
