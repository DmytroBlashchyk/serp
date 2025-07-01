import { IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface ProjectBySharedLinkType {
  id: IdType;
  project_name: string;
  business_name?: string;
  url?: string;
  location: string;
  region_id: IdType;
  region_name: string;
  region_country_name: string;
  language_id: IdType;
  language_name: string;
  language_code: string;
  search_engine_id: IdType;
  search_engine_name: string;
  desktop_type_count: number;
  mobile_type_count: number;
  keywords_count: number;
  email_report_count: number;
  trigger_count: number;
  updated_at: Date;
  update_date: string;
  previous_update_date: string;

  check_frequency_id: IdType;
  check_frequency_name: CheckFrequencyEnum;
  keyword_project_type: DeviceTypesEnum;
  tag_count: number;
  number_of_keywords_that_are_updated: number;
}
