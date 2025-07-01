import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { KeywordPositionEntity } from 'modules/keywords/entities/keyword-position.entity';
import { TriggerKeywordEntity } from 'modules/triggers/entities/trigger-keyword.entity';
import { KeywordPositionsForDayEntity } from 'modules/keywords/entities/keyword-positions-for-day.entity';
import { IdLiteralType, IdType } from 'modules/common/types/id-type.type';

@Entity('keywords')
export class KeywordEntity {
  @Column({ type: 'text' })
  name: string;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  project: ProjectEntity;

  @ManyToOne(() => DeviceTypeEntity)
  deviceType: DeviceTypeEntity;

  @ManyToMany(() => KeywordTagEntity, (keywordTag) => keywordTag.keywords, {
    nullable: true,
    eager: true,
  })
  @JoinTable()
  tags?: KeywordTagEntity[];

  @OneToMany(() => KeywordPositionEntity, (position) => position.keyword)
  keywordPosition: KeywordPositionEntity[];

  @Column({ type: 'boolean', default: false })
  positionUpdate: boolean;

  @OneToMany(
    () => TriggerKeywordEntity,
    (triggerKeyword) => triggerKeyword.keyword,
  )
  triggerKeyword: TriggerKeywordEntity[];

  @Column({ type: 'numeric', default: 0 })
  searchVolume: number;

  @Column({ type: 'float', default: 0 })
  cpc: number;

  @Column({ type: 'numeric', default: 0 })
  competitionIndex: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastUpdateDate?: Date;

  @Column({ type: 'boolean', default: true })
  manualUpdateAvailable: boolean;

  @OneToMany(
    () => KeywordPositionsForDayEntity,
    (keywordPositionsForDay) => keywordPositionsForDay.keyword,
  )
  keywordPositionsForDay: KeywordPositionsForDayEntity[];

  @PrimaryGeneratedColumn({ type: IdLiteralType })
  id: IdType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
