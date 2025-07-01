import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EmailReportEntity } from 'modules/email-reports/entities/email-report.entity';

@Entity('report_recipients')
export class ReportRecipientEntity extends BaseEntity {
  @Column({ type: 'text' })
  email: string;

  @ManyToOne(() => EmailReportEntity, (emailReport) => emailReport.recipients, {
    onDelete: 'CASCADE',
  })
  emailReport: EmailReportEntity;
}
