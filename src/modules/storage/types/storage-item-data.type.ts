import type { Readable } from 'stream';
import { BucketStoragePathsEnum } from 'modules/storage/enums/bucket-storage-paths.enum';

export interface StorageItemDataType {
  fileStream: Readable;
  fileName: string;
  storagePath: BucketStoragePathsEnum;
  sizeInBytes?: number;
}
