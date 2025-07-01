import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';
import { Entity } from 'typeorm';

@Entity('report_types')
export class ReportTypeEntity extends BaseEnumEntity<ReportTypeEnum> {}
