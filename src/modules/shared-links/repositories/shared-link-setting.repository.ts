import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SharedLinkSettingEntity } from 'modules/shared-links/entities/shared-link-setting.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';

@Injectable()
@EntityRepository(SharedLinkSettingEntity)
export class SharedLinkSettingRepository extends BaseRepository<SharedLinkSettingEntity> {}
