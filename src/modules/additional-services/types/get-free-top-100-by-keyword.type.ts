import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface GetFreeTop100ByKeywordType {
  deviceType: DeviceTypesEnum;
  countryId: IdType;
  domainName: string;
  keyword: string;
}
