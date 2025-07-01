import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';

@Entity('keywords_positions')
export class KeywordPositionEntity extends BaseEntity {
  @ManyToOne(() => KeywordEntity, { onDelete: 'CASCADE' })
  keyword: KeywordEntity;

  @Column({ type: 'numeric' })
  position: number;

  @Column({ type: 'numeric', default: 0 })
  previousPosition: number;

  @Column({ type: 'text', default: '' })
  url: string;
}
