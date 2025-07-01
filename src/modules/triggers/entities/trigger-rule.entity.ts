import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { TriggerRuleEnum } from 'modules/triggers/enums/trigger-rule.enum';
import { Entity } from 'typeorm';

@Entity('trigger_rules')
export class TriggerRuleEntity extends BaseEnumEntity<TriggerRuleEnum> {}
