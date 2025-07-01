import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface FreeType {
  domainName: string;
  countryId: IdType;
  deviceType: DeviceTypesEnum;
  keywords: string[];
  competitorDomains: string[];
  ipAddress: string;
}
