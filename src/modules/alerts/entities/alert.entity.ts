import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { AlertKeywordEntity } from 'modules/alerts/entities/alert-keyword.entity';
import { AlertViewEntity } from 'modules/alerts/entities/alert-view.entity';

@Entity('alerts')
export class AlertEntity extends BaseEntity {
  @ManyToOne(() => TriggerEntity, { onDelete: 'CASCADE' })
  trigger: TriggerEntity;

  @OneToMany(() => AlertKeywordEntity, (alertKeywords) => alertKeywords.alert)
  alertKeywords: AlertKeywordEntity[];

  @OneToMany(() => AlertViewEntity, (view) => view.alert)
  views: AlertViewEntity[];
}
