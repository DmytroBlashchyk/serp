import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { ProjectTagEntity } from 'modules/tags/entities/project-tag.entity';
import { LanguageEntity } from 'modules/languages/entities/language.entity';
import { SearchEngineEntity } from 'modules/search-engines/entities/search-engine.entity';
import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';
import { CompetitorEntity } from 'modules/competitors/entities/competitor.entity';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { UserEntity } from 'modules/users/entities/user.entity';
import { GoogleDomainEntity } from 'modules/google-domains/entities/google-domain.entity';
import { ProjectUrlTypeEntity } from 'modules/projects/entities/project-url-type.entity';
import { FolderEntity } from 'modules/folders/entities/folder.entity';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';
import { TriggerEntity } from 'modules/triggers/entities/trigger.entity';
import { LocationEntity } from 'modules/countries/entities/location.entity';
import { LatestProjectOverviewEntity } from 'modules/projects/entities/latest-project-overview.entity';
import { EmailReportEntity } from 'modules/email-reports/entities/email-report.entity';
import { IdLiteralType, IdType } from 'modules/common/types/id-type.type';

@Entity('projects')
export class ProjectEntity {
  @Column({ type: 'text' })
  projectName: string;

  @Column({ type: 'text', nullable: true })
  businessName?: string;

  @Column({ type: 'text', nullable: true })
  url?: string;

  @OneToMany(() => KeywordEntity, (keyword) => keyword.project, {
    cascade: true,
    nullable: true,
  })
  keywords?: KeywordEntity[];

  @ManyToOne(() => LocationEntity, { nullable: true })
  location?: LocationEntity;

  @ManyToOne(() => LanguageEntity)
  language: LanguageEntity;

  @ManyToMany(() => ProjectTagEntity, (tag) => tag.projects, {
    nullable: true,
    eager: true,
  })
  @JoinTable()
  tags?: ProjectTagEntity[];

  @ManyToOne(() => SearchEngineEntity)
  searchEngine: SearchEngineEntity;

  @ManyToOne(() => GoogleDomainEntity, { nullable: true })
  region?: GoogleDomainEntity;

  @ManyToOne(() => CheckFrequencyEntity)
  checkFrequency: CheckFrequencyEntity;

  @OneToMany(() => CompetitorEntity, (competitor) => competitor.project)
  competitors?: CompetitorEntity[];

  @OneToMany(() => NoteEntity, (note) => note.project)
  notes?: NoteEntity[];

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  account: AccountEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  creator: UserEntity;

  @ManyToMany(() => UserEntity, (user) => user.projects, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  @JoinTable({ name: 'users_projects' })
  users: UserEntity[];

  @ManyToOne(() => ProjectUrlTypeEntity, (projectUrl) => projectUrl.id, {
    nullable: true,
  })
  urlType?: ProjectUrlTypeEntity;

  @ManyToMany(() => FolderEntity, (folder) => folder.projects)
  folders: FolderEntity[];

  @ManyToMany(() => SharedLinkEntity, (sharedLink) => sharedLink.projects, {
    nullable: true,
    eager: true,
  })
  @JoinTable({ name: 'projects_shared_links' })
  sharedLinks: SharedLinkEntity[];

  @OneToMany(() => TriggerEntity, (trigger) => trigger.project)
  triggers: TriggerEntity[];

  @OneToOne(
    () => LatestProjectOverviewEntity,
    (latestProjectOverview) => latestProjectOverview.project,
  )
  lastProjectOverview: LatestProjectOverviewEntity;

  @OneToMany(() => EmailReportEntity, (emailReport) => emailReport.project)
  emailReports: EmailReportEntity[];

  @PrimaryGeneratedColumn({ type: IdLiteralType })
  id: IdType;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt: Date;
}
