import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SharedLinkTypeEntity } from 'modules/shared-links/entities/shared-link-type.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SharedLinkTypeEnum } from 'modules/shared-links/enums/shared-link-type.enum';

@Injectable()
@EntityRepository(SharedLinkTypeEntity)
export class SharedLinkTypeRepository extends BaseRepository<SharedLinkTypeEntity> {
  /**
   * Retrieves a shared link type entity by its name.
   *
   * @param {SharedLinkTypeEnum} name - The name of the shared link type to retrieve.
   * @return {Promise<SharedLinkTypeEntity>} The shared link type entity that matches the given name.
   */
  async getSharedLinkTypeByName(
    name: SharedLinkTypeEnum,
  ): Promise<SharedLinkTypeEntity> {
    return this.findOne({ name });
  }
}
