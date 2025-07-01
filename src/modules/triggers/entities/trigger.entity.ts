import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { TriggerKeywordEntity } from 'modules/triggers/entities/trigger-keyword.entity';
import { TriggerRuleEntity } from 'modules/triggers/entities/trigger-rule.entity';
import { TriggerRecipientEntity } from 'modules/triggers/entities/trigger-recipient.entity';
import { TriggerTypeEntity } from 'modules/triggers/entities/trigger-type.entity';
import { UserEntity } from 'modules/users/entities/user.entity';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';

@Entity('triggers')
export class TriggerEntity extends BaseEntity {
  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  project: ProjectEntity;

  @OneToMany(
    () => TriggerKeywordEntity,
    (triggerKeyword) => triggerKeyword.trigger,
  )
  triggerKeywords?: TriggerKeywordEntity[];

  @ManyToOne(() => TriggerRuleEntity)
  rule: TriggerRuleEntity;

  @ManyToOne(() => TriggerTypeEntity)
  type: TriggerTypeEntity;

  @Column({ type: 'numeric', default: 0 })
  threshold: number;

  @OneToMany(() => TriggerRecipientEntity, (recipient) => recipient.trigger)
  recipients?: TriggerRecipientEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  owner: UserEntity;

  @OneToMany(() => AlertEntity, (alert) => alert.trigger)
  alerts: AlertEntity[];
}
