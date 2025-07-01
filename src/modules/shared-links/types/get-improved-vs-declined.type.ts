import { IdType } from 'modules/common/types/id-type.type';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface GetImprovedVsDeclinedType {
  link: string;
  projectId: IdType;
  period: TemporalFiltersEnum;
  improvedFilter: BooleanEnum;
  declinedFilter: BooleanEnum;
  lostFilter: BooleanEnum;
  noChange: BooleanEnum;
  deviceType: DeviceTypesEnum;
}
