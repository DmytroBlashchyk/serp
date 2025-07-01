import { IdType } from 'modules/common/types/id-type.type';

export interface HandleMonthlyKeywordUpdateType {
  accountId: IdType;
  accountLimitUsed: number;
  balanceAccountLimit: number;
}
