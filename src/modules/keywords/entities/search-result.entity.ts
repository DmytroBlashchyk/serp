import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('search_results')
export class SearchResultEntity extends BaseEntity {
  @ManyToOne(() => KeywordEntity, { onDelete: 'CASCADE' })
  keyword: KeywordEntity;

  @Column('jsonb', { nullable: true })
  result: object[];
}
