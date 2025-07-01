import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TriggerTypeEntity } from 'modules/triggers/entities/trigger-type.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';

@Injectable()
@EntityRepository(TriggerTypeEntity)
export class TriggerTypeRepository extends BaseRepository<TriggerTypeEntity> {
  /**
   * Retrieves a trigger type entity by its name.
   *
   * @param {TriggerTypeEnum} name - The name of the trigger type to retrieve.
   * @return {Promise<TriggerTypeEntity>} The promise that resolves to the trigger type entity.
   */
  async getTriggerTypeByName(
    name: TriggerTypeEnum,
  ): Promise<TriggerTypeEntity> {
    return this.findOne({ where: { name } });
  }
}
