import { IdType } from 'modules/common/types/id-type.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';

export interface ChangeFrequencyForProjectsType {
  accountId: IdType;
  projectIds: IdType[];
  frequency: CheckFrequencyEnum;
  userId?: IdType;
}
