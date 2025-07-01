import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';
import { BucketStoragePathsEnum } from 'modules/storage/enums/bucket-storage-paths.enum';

@Entity('storage_items')
export class StorageItemEntity extends BaseEntity {
  @Column('text')
  storedFileName: string;

  @Column('text')
  originalFileName: string;

  @Column('text')
  storagePath: BucketStoragePathsEnum;

  @Column('bigint', { default: 0, nullable: true })
  sizeInBytes: number;
}
