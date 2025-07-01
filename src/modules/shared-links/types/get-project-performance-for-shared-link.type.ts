import { IdType } from 'modules/common/types/id-type.type';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

export interface GetProjectPerformanceForSharedLinkType {
  projectId: IdType;
  link: string;
  period?: TemporalFiltersEnum;
  fromDate?: Date;
  toDate?: Date;
  competitorIds?: IdType[];
  deviceType: DeviceTypesEnum;
}
