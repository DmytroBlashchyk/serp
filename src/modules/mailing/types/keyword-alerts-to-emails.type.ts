import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { IdType } from 'modules/common/types/id-type.type';

export interface KeywordAlertsToEmailsType {
  keywordName: string;
  projectId: IdType;
  projectName: string;
  previousPosition: string;
  currentPosition: string;
  device: DeviceTypesEnum;
  difference: string;
}
