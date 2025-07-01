import { IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

export interface ContentType {
  id: IdType;
  name: string;
  url: string;
  type: number;
  frequency_id: IdType;
  frequency_name: CheckFrequencyEnum;
  updated_at: Date;
  created_at: Date;
  keywords_count: number;
  created_by: string;
  improved: number;
  declined: number;
  no_change: number;
  update_date: string;
  previous_update_date: string;
  desktop_type_count: number;
  mobile_type_count: number;
  project_device_type: DeviceTypesEnum;
  last_modified?: Date;
  search_engines_id?: IdType;
  search_engines_name?: SearchEnginesEnum;

  google_domains_id?: IdType;
  google_domains_name?: string;
  google_domains_country_name?: string;
  number_of_keywords_that_are_updated: number;
}
