import { BaseResponse } from 'modules/common/responses/base.response';
import { ResponseProperty } from 'modules/common/decorators/response-property.decorator';
import { BucketStoragePathsEnum } from 'modules/storage/enums/bucket-storage-paths.enum';

export class StorageItemResponse extends BaseResponse<StorageItemResponse> {
  @ResponseProperty()
  storedFileName: string;

  @ResponseProperty()
  originalFileName: string;

  @ResponseProperty()
  storagePath: BucketStoragePathsEnum;
}
