import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToOne } from 'typeorm';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { SharedLinkTypeEntity } from 'modules/shared-links/entities/shared-link-type.entity';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { SharedLinkSettingEntity } from 'modules/shared-links/entities/shared-link-setting.entity';

@Entity('shared_links')
export class SharedLinkEntity extends BaseEntity {
  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  account: AccountEntity;

  @Column({ type: 'boolean' })
  enableSharing: boolean;

  @Column({ type: 'boolean' })
  requirePassword: boolean;

  @Column({ type: 'text', nullable: true })
  password?: string;

  @Column({ type: 'text' })
  link: string;

  @ManyToMany(() => ProjectEntity, (project) => project.sharedLinks)
  projects: ProjectEntity[];

  @ManyToOne(() => SharedLinkTypeEntity)
  type: SharedLinkTypeEntity;

  @OneToOne(() => SharedLinkSettingEntity, (settings) => settings.sharedLink, {
    cascade: true,
  })
  settings: SharedLinkSettingEntity;

  @Column({ type: 'timestamptz', nullable: true })
  lastViewed?: Date;
}
