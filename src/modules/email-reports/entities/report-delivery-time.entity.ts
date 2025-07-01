import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { ReportDeliveryTimeEnum } from 'modules/email-reports/enums/report-delivery-time.enum';
import { Entity } from 'typeorm';

@Entity('report_delivery_time')
export class ReportDeliveryTimeEntity extends BaseEnumEntity<ReportDeliveryTimeEnum> {}
