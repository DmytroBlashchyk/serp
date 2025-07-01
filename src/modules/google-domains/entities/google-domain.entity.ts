import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';

@Entity('google_domains')
export class GoogleDomainEntity extends BaseEntity {
  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text' })
  countryName: string;
}
