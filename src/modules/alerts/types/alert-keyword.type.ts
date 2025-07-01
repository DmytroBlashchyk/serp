import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface AlertKeywordType {
  keyword_name: string;
  desktop_types_id: IdType;
  desktop_types_name: DeviceTypesEnum;
  previous_position: number;
  date_of_previous_position: Date;
  current_position: number;
  difference: number;
  alerts_keywords_id: IdType;
  date_of_current_position: Date;
}
