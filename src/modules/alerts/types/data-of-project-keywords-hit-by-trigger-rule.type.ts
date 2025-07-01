import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface DataOfProjectKeywordsHitByTriggerRuleType {
  keyword_id: IdType;
  keyword_name: string;
  keyword_positions_for_day_id: IdType;
  device_type_id: IdType;
  device_type_name: DeviceTypesEnum;
  previous_position: string;
  current_position: string;
}
