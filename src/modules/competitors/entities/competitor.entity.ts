import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { CompetitorKeywordPositionEntity } from 'modules/competitors/entities/competitor-keyword-position.entity';

@Entity('competitors')
export class CompetitorEntity extends BaseEntity {
  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  project: ProjectEntity;

  @Column({ type: 'text', nullable: true })
  domainName?: string;

  @ManyToMany(
    () => CompetitorKeywordPositionEntity,
    (position) => position.competitor,
  )
  competitorKeywordPositions: CompetitorKeywordPositionEntity[];

  @Column({ type: 'text', nullable: true })
  businessName?: string;

  @Column({ type: 'text', nullable: true })
  url?: string;
}
