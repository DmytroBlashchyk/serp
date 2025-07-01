import { IdType } from 'modules/common/types/id-type.type';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';
import { ReportDeliveryTimeEnum } from 'modules/email-reports/enums/report-delivery-time.enum';

export interface CreateEmailReportType {
  accountId: IdType;
  projectId: IdType;
  recipients: string[];
  frequency: EmailReportFrequencyEnum;
  reportType: ReportTypeEnum;
  reportDeliveryTimeId: IdType;
  userId: IdType;
}
