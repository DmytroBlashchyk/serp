import { Injectable, NotFoundException } from '@nestjs/common';
import { TriggerRuleRepository } from 'modules/triggers/repositories/trigger-rule.repository';
import { TriggerRulesResponse } from 'modules/triggers/responses/trigger-rules.response';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { TriggerRuleEntity } from 'modules/triggers/entities/trigger-rule.entity';

@Injectable()
export class TriggerRulesService {
  constructor(private readonly triggerRuleRepository: TriggerRuleRepository) {}

  /**
   * Retrieves the trigger rule entity based on the provided rule name.
   *
   * @param {TriggerRuleEnum} name - The name of the trigger rule.
   * @return {Promise<TriggerRuleEntity>} A promise that resolves to the trigger rule entity.
   * @throws {NotFoundException} If the trigger rule is not found.
   */
  async getTriggerRule(name: TriggerRuleEnum): Promise<TriggerRuleEntity> {
    const triggerRule = await this.triggerRuleRepository.getTriggerRuleByName(
      name,
    );
    if (!triggerRule) {
      throw new NotFoundException('Trigger rule not found.');
    }
    return triggerRule;
  }

  /**
   * Retrieves all trigger rules from the repository.
   * @return {Promise<TriggerRulesResponse>} A promise that resolves to a TriggerRulesResponse containing all trigger rules.
   */
  async getAllTriggerRules(): Promise<TriggerRulesResponse> {
    const triggerRules = await this.triggerRuleRepository.find();
    return new TriggerRulesResponse({ items: triggerRules });
  }
}
