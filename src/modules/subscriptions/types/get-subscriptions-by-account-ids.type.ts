import { IdType } from 'modules/common/types/id-type.type';

export interface GetSubscriptionsByAccountIdsType {
  max: Date;
  id: IdType;
  created_at: Date;
  updated_at: Date;
  available_number_of_updates: number;
  activation_date: Date;
  status_update_date: Date;
  subscription_id: string;
  customer_id: string;
  account_id: IdType;
  status_id: IdType;
  transaction_id: IdType;
  tariff_plan_setting_id: IdType;
  transaction_status_id: IdType;
  card_id: IdType;
  number_of_daily_updates_available: number;
}
