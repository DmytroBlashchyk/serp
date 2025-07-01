import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Entity, ManyToOne, OneToMany } from 'typeorm';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { AlertEntity } from 'modules/alerts/entities/alert.entity';
import { AlertKeywordViewEntity } from 'modules/alerts/entities/alert-keyword-view.entity';
import { KeywordPositionsForDayEntity } from 'modules/keywords/entities/keyword-positions-for-day.entity';

@Entity('alerts_keywords')
export class AlertKeywordEntity extends BaseEntity {
  @ManyToOne(() => AlertEntity, { onDelete: 'CASCADE' })
  alert: AlertEntity;

  @ManyToOne(() => KeywordEntity, { onDelete: 'CASCADE' })
  keyword: KeywordEntity;

  @ManyToOne(() => KeywordPositionsForDayEntity, { onDelete: 'CASCADE' })
  keywordPositionsForDay: KeywordPositionsForDayEntity;

  @OneToMany(() => AlertKeywordViewEntity, (view) => view.alertKeyword)
  views: AlertKeywordViewEntity[];
}
