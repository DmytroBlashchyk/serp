import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { FolderProjectResponse } from 'modules/folders/responses/folder-project.response';
import { CreatedByResponse } from 'modules/folders/responses/created-by.response';

export class FolderResponse extends BaseResponse<FolderResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  createdAt: string;

  @ResponseProperty()
  updatedAt: string;

  @ResponseProperty({ cls: FolderProjectResponse, each: true, nullable: true })
  projects: FolderProjectResponse[];

  @ResponseProperty({ cls: FolderResponse, nullable: true, each: true })
  children?: FolderResponse[];

  @ResponseProperty({ cls: CreatedByResponse })
  owner: CreatedByResponse;

  @ResponseProperty()
  internalFolderCount: number;

  @ResponseProperty()
  available: boolean;
}
