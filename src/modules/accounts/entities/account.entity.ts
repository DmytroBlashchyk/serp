import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { CountryEntity } from 'modules/countries/entities/country.entity';
import { StorageItemEntity } from 'modules/storage/entities/storage-item.entity';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { FolderEntity } from 'modules/folders/entities/folder.entity';
import { SubscriptionEntity } from 'modules/subscriptions/entities/subscription.entity';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { InvitationEntity } from 'modules/invitations/entities/invitation.entity';
import { AccountLimitEntity } from 'modules/account-limits/entities/account-limit.entity';

@Entity({ name: 'accounts' })
export class AccountEntity extends BaseEntity {
  @ManyToOne(() => UserEntity)
  owner: UserEntity;

  @ManyToOne(() => CountryEntity)
  country: CountryEntity;

  @ManyToOne(() => TimezoneEntity)
  timezone: TimezoneEntity;

  @Column('text', { nullable: true })
  companyName?: string;

  @Column('text', { nullable: true })
  companyUrl?: string;

  @Column('text', { nullable: true })
  tagline?: string;

  @OneToOne(() => StorageItemEntity, { nullable: true })
  @JoinColumn()
  companyLogo?: StorageItemEntity;

  @Column('text', { nullable: true })
  twitterLink?: string;

  @Column('text', { nullable: true })
  facebookLink?: string;

  @Column('text', { nullable: true })
  linkedinLink?: string;

  @Column({ type: 'boolean', default: true })
  emailReports: boolean;

  @Column({ type: 'boolean', default: true })
  sharedLinks: boolean;

  @Column({ type: 'boolean', default: false })
  validatedBySerpnest: boolean;

  @DeleteDateColumn({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @OneToMany(() => AccountUserEntity, (accountUser) => accountUser.account, {
    cascade: true,
  })
  accountUsers: AccountUserEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.account, {
    cascade: true,
  })
  projects: ProjectEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.account)
  folders: FolderEntity[];

  @Column({ type: 'text', nullable: true })
  apiKey: string;

  @OneToOne(() => SubscriptionEntity, { nullable: true })
  @JoinColumn()
  subscription: SubscriptionEntity;

  @ManyToOne(() => TariffPlanSettingEntity, { nullable: true })
  preferredTariffPlan?: TariffPlanSettingEntity;

  @OneToMany(() => InvitationEntity, (invitation) => invitation.account)
  accountInvitations: InvitationEntity[];

  @OneToMany(() => AccountLimitEntity, (accountLimit) => accountLimit.account)
  limits: AccountLimitEntity[];
}
