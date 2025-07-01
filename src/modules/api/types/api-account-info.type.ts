import { IdType } from 'modules/common/types/id-type.type';

export interface ApiAccountInfoType {
  id: IdType;
  company_name: string;
  company_url: string;
  tagline?: string;
  twitter_link?: string;
  facebook_link?: string;
  linkedin_link?: string;
  email_reports_count: number;
  shared_links_count: number;
  project_number: number;
  keyword_count: number;
  trigger_count: number;
}
