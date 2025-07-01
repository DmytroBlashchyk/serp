import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';

export interface GetKeywordTrendsType {
  accountId: IdType;
  projectId: IdType;
  period: TemporalFiltersEnum;
  deviceType: DeviceTypesEnum;
  userId?: IdType;
}
