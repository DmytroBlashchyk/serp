import { BaseResponse } from 'modules/common/responses/base.response';
import { IdType } from 'modules/common/types/id-type.type';
import { IdProperty } from 'modules/common/decorators/id-property';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class MyFolderResponse extends BaseResponse<MyFolderResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty()
  createdBy: string;

  @ResponseProperty()
  createdAt: string;

  @ResponseProperty()
  createdAtFullFormat: string;

  @ResponseProperty()
  updatedAt: string;

  @ResponseProperty()
  updatedAtFullFormat: string;

  @ResponseProperty()
  keywordCount: number;
}
