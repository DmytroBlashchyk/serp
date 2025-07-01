import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { TriggerTypeEnum } from 'modules/triggers/enums/trigger-type.enum';
import { Entity } from 'typeorm';

@Entity('trigger_types')
export class TriggerTypeEntity extends BaseEnumEntity<TriggerTypeEnum> {}
