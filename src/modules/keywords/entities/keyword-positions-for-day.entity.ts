import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';

@Entity('keyword_positions_for_day')
@Unique(['keyword', 'updateDate'])
export class KeywordPositionsForDayEntity extends BaseEntity {
  @ManyToOne(() => KeywordEntity, { onDelete: 'CASCADE' })
  keyword: KeywordEntity;

  @Column({ type: 'date' })
  updateDate: Date;

  @Column({
    type: 'float',
    transformer: {
      to: (value) => value,
      from: (value) => Math.min(Math.max(1, value), 101),
    },
  })
  position: number;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'date' })
  previousUpdateDate: Date;

  @Column({
    type: 'float',
    default: 101,
    transformer: {
      to: (value) => value,
      from: (value) => Math.min(Math.max(1, value), 101),
    },
    nullable: true,
  })
  previousPosition: number;
}
