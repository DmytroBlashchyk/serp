import { IdType } from 'modules/common/types/id-type.type';

export interface GetAccountsLimitsType {
  account_id: IdType;
  available_keywords: number;
  subscription_id: IdType;
}
