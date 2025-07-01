import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';
import { Entity } from 'typeorm';

@Entity('email_report_frequency')
export class EmailReportFrequencyEntity extends BaseEnumEntity<EmailReportFrequencyEnum> {}
