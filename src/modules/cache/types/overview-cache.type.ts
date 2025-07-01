import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface OverviewCacheType {
  accountId: IdType;
  projectId: IdType;
  fromDate: string;
  toDate: string;
  deviceType: DeviceTypesEnum;
}
