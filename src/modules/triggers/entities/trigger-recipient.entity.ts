import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';

@Entity('trigger_recipients')
export class TriggerRecipientEntity extends BaseEntity {
  @Column({ type: 'text' })
  email: string;

  @ManyToOne(() => TriggerEntity, { onDelete: 'CASCADE' })
  trigger: TriggerEntity;

  @Column({ type: 'boolean', default: true })
  subscribed: boolean;
}
