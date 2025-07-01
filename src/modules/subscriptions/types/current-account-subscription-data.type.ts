import { IdType } from 'modules/common/types/id-type.type';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';

export interface CurrentAccountSubscriptionDataType {
  total_keywords: number;
  subscriptions_id: IdType;
  subscriptions_available_number_of_updates: number;
  subscriptions_number_of_daily_updates_available: number;
  tariff_plan_settings_id: IdType;
  tariff_plan_settings_monthly_word_count: number;
  tariff_plan_settings_daily_word_count: number;
  subscription_statuses_id: IdType;
  subscription_statuses_name: SubscriptionStatusesEnum;
}
