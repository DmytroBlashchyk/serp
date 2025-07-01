import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity } from 'typeorm';

@Entity('locations')
export class LocationEntity extends BaseEntity {
  @Column({ type: 'text' })
  locationName: string;

  @Column({ type: 'numeric' })
  locationCode: number;

  @Column({ type: 'numeric', nullable: true })
  locationCodeParent?: number;

  @Column({ type: 'text' })
  countryIsoCode: string;

  @Column({ type: 'text' })
  locationType: string;

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
