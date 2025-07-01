import { IdType } from 'modules/common/types/id-type.type';

export interface LimitChangesType {
  accountId: IdType;
  subscriptionId: IdType;
  numberOfDailyUpdatesAvailable: number;
  availableNumberOfUpdates: number;
}
