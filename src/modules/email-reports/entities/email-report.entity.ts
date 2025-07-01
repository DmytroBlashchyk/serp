import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { ReportTypeEntity } from 'modules/email-reports/entities/report-type.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { ReportRecipientEntity } from 'modules/email-reports/entities/report-recipient.entity';
import { ReportDeliveryTimeEntity } from 'modules/email-reports/entities/report-delivery-time.entity';
import { EmailReportFrequencyEntity } from 'modules/email-reports/entities/email-report-frequency.entity';

@Entity('email_reports')
export class EmailReportEntity extends BaseEntity {
  @ManyToOne(() => ReportTypeEntity)
  type: ReportTypeEntity;

  @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
  project: ProjectEntity;

  @OneToMany(() => ReportRecipientEntity, (recipient) => recipient.emailReport)
  recipients: ReportRecipientEntity[];

  @ManyToOne(() => EmailReportFrequencyEntity)
  frequency: EmailReportFrequencyEntity;

  @ManyToOne(() => ReportDeliveryTimeEntity)
  deliveryTime: ReportDeliveryTimeEntity;

  @Column({ type: 'timestamptz', nullable: true })
  lastSent?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  nextDelivery?: Date;
}
