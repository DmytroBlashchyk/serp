import { IdType } from 'modules/common/types/id-type.type';

export interface AllLimitsOfCurrentAccountType {
  keyword_count: number;
  trigger_count: number;
  email_report_count: number;
  user_count: number;
  project_count: number;
  invitation_count: number;
  competitor_count: number;
  note_count: number;
  shared_link_count: number;
  account_id: IdType;
  number_of_recipients_of_email_reports: number;
}
