import { IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

export interface ProjectAvailableToUserType {
  project_device_type: DeviceTypesEnum;
  id: IdType;
  account_id: IdType;
  project_name: string;
  url: string;
  desktop_type_count: number;
  mobile_type_count: number;
  count: number;
  frequency_id: IdType;
  frequency_name: CheckFrequencyEnum;
  created_at: Date;
  updated_at: Date;
  region_id: IdType;
  region_name: string;
  region_country_name: string;
  search_engines_id: IdType;
  search_engines_name: SearchEnginesEnum;
  number_of_keywords_that_are_updated: number;
  declined: number;
  improved: number;
  no_change: number;
  lost: number;
}
