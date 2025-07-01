import { Column, Entity, JoinColumn, OneToOne, Unique } from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';

@Entity('latest_project_overview')
@Unique(['project'])
export class LatestProjectOverviewEntity extends BaseEntity {
  @OneToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  @JoinColumn()
  project: ProjectEntity;

  @Column({ type: 'float', default: 0 })
  declined: number;

  @Column({ type: 'float', default: 0 })
  improved: number;

  @Column({ type: 'float', default: 0 })
  noChange: number;

  @Column({ type: 'float', default: 0 })
  lost: number;

  @Column({ type: 'float', default: 0 })
  top3: number;

  @Column({ type: 'float', default: 0 })
  top3Lost: number;

  @Column({ type: 'float', default: 0 })
  top3New: number;

  @Column({ type: 'float', default: 0 })
  top10: number;

  @Column({ type: 'float', default: 0 })
  top10Lost: number;

  @Column({ type: 'float', default: 0 })
  top10New: number;

  @Column({ type: 'float', default: 0 })
  top30: number;

  @Column({ type: 'float', default: 0 })
  top30Lost: number;

  @Column({ type: 'float', default: 0 })
  top30New: number;

  @Column({ type: 'float', default: 0 })
  top100: number;

  @Column({ type: 'float', default: 0 })
  top100Lost: number;

  @Column({ type: 'float', default: 0 })
  top100New: number;

  @Column({ type: 'float', default: 0 })
  avg: number;

  @Column({ type: 'float', default: 0 })
  avgChange: number;

  @Column({ type: 'date' })
  updateDate: Date;

  @Column({ type: 'date' })
  previousUpdateDate: Date;

  @Column({ type: 'boolean' })
  increasingAveragePosition: boolean;
}
