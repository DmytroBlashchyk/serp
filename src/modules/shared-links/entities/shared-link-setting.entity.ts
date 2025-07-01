import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';

@Entity('shared_link_settings')
export class SharedLinkSettingEntity extends BaseEntity {
  @OneToOne(() => SharedLinkEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  sharedLink: SharedLinkEntity;

  @Column({ type: 'boolean', default: true })
  position: boolean;

  @Column({ type: 'boolean', default: true })
  oneDayChange: boolean;

  @Column({ type: 'boolean', default: true })
  sevenDayChange: boolean;

  @Column({ type: 'boolean', default: true })
  thirtyDayChange: boolean;

  @Column({ type: 'boolean', default: true })
  startingRank: boolean;

  @Column({ type: 'boolean', default: true })
  bestRank: boolean;

  @Column({ type: 'boolean', default: true })
  lifeTimeChange: boolean;

  @Column({ type: 'boolean', default: true })
  volume: boolean;

  @Column({ type: 'boolean', default: true })
  url: boolean;

  @Column({ type: 'boolean', default: true })
  updated: boolean;
}
