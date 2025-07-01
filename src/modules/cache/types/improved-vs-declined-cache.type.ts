import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface ImprovedVsDeclinedCacheType {
  projectId: IdType;
  fromDate: string;
  toDate: string;
  deviceType: DeviceTypesEnum;
}
