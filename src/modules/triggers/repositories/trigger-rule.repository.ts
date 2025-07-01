import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TriggerRuleEntity } from 'modules/triggers/entities/trigger-rule.entity';
import { Injectable } from '@nestjs/common';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';

@Injectable()
@EntityRepository(TriggerRuleEntity)
export class TriggerRuleRepository extends BaseRepository<TriggerRuleEntity> {
  /**
   * Retrieves a trigger rule entity by its name.
   *
   * @param {TriggerRuleEnum} name - The name of the trigger rule to retrieve.
   * @return {Promise<TriggerRuleEntity>} A promise that resolves to the trigger rule entity.
   */
  async getTriggerRuleByName(
    name: TriggerRuleEnum,
  ): Promise<TriggerRuleEntity> {
    return this.findOne({ where: { name } });
  }
}
