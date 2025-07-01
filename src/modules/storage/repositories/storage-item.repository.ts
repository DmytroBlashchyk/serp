import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { StorageItemEntity } from 'modules/storage/entities/storage-item.entity';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';

@Injectable()
@EntityRepository(StorageItemEntity)
export class StorageItemRepository extends BaseRepository<StorageItemEntity> {}
