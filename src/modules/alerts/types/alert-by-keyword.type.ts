import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface AlertByKeywordType {
  created_at: Date;
  id: IdType;
  keyword_id: IdType;
  keyword_name: string;
  project_id: IdType;
  project_name: string;
  previous_rank: number;
  new_rank: number;
  difference: number;
  trigger_rules_id: number;
  trigger_rules_name: number;
  threshold: number;
  desktop_types_id: IdType;
  desktop_types_name: DeviceTypesEnum;
  view: boolean;
}
