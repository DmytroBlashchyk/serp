import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';

export interface ImprovedVsDeclinedType {
  accountId: IdType;
  projectId: IdType;
  period: TemporalFiltersEnum;
  improvedFilter: BooleanEnum;
  declinedFilter: BooleanEnum;
  lostFilter: BooleanEnum;
  noChange: BooleanEnum;
  deviceType: DeviceTypesEnum;
  userId?: IdType;
}
