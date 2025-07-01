import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity('languages')
export class LanguageEntity extends BaseEntity {
  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'boolean', default: false })
  serp: boolean;

  @Column({ type: 'boolean', default: false })
  keywordData: boolean;

  @Column({ type: 'boolean', default: false })
  serpBing: boolean;

  @Column({ type: 'boolean', default: false })
  keywordDataBing: boolean;

  @Column({ type: 'boolean', default: false })
  serpYouTube: boolean;

  @Column({ type: 'boolean', default: false })
  serpYahoo: boolean;

  @Column({ type: 'boolean', default: false })
  serpBaidu: boolean;
}
