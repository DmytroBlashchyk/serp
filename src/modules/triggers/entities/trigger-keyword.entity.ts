import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';

@Entity('triggers_keywords')
export class TriggerKeywordEntity extends BaseEntity {
  @ManyToOne(() => TriggerEntity, { onDelete: 'CASCADE' })
  trigger: TriggerEntity;

  @ManyToOne(() => KeywordEntity, { onDelete: 'CASCADE' })
  keyword: KeywordEntity;

  @Column({ type: 'boolean', default: false })
  triggerInitialization: boolean;
}
