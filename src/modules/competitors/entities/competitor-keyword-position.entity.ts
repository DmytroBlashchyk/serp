import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { CompetitorEntity } from 'modules/competitors/entities/competitor.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('competitors_keywords_positions')
export class CompetitorKeywordPositionEntity extends BaseEntity {
  @ManyToOne(() => CompetitorEntity, { onDelete: 'CASCADE' })
  competitor: CompetitorEntity;

  @ManyToOne(() => KeywordEntity, { onDelete: 'CASCADE' })
  keyword: KeywordEntity;

  @Column({ type: 'numeric' })
  position: number;
}
