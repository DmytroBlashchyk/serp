import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { SerpnestSharedTokenData } from 'modules/common/types/serpnest-shared-token-data.type';

export interface GetOverviewType {
  link: string;
  projectId: IdType;
  fromDate?: string;
  toDate?: string;
  deviceType: DeviceTypesEnum;
  tokenData: SerpnestSharedTokenData;
}
