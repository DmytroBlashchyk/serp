import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'countries' })
export class CountryEntity extends BaseEntity {
  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ type: 'text', unique: true })
  image: string;
}
