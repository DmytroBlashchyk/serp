import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';

@Entity('keywords_tags')
export class KeywordTagEntity extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @ManyToMany(() => KeywordEntity, (keyword) => keyword.tags, { lazy: true })
  keywords: KeywordEntity[];
}
