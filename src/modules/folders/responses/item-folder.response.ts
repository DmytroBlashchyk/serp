import { BaseResponse } from 'modules/common/responses/base.response';
import { IdProperty } from 'modules/common/decorators/id-property';
import { IdType } from 'modules/common/types/id-type.type';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';

export class ItemFolderResponse extends BaseResponse<ItemFolderResponse> {
  @IdProperty()
  id: IdType;

  @ResponseProperty()
  name: string;

  @ResponseProperty({ cls: ItemFolderResponse, nullable: true, each: true })
  children?: ItemFolderResponse[];
}
