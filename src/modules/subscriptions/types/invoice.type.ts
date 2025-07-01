import { IdType } from 'modules/common/types/id-type.type';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';

export interface InvoiceType {
  id: IdType;
  subscription_id: string;
  transaction_id: string;
  activation_date: Date;
  tariff_plan_id: IdType;
  tariff_plan_name: TariffPlansEnum;
  tariff_plan_settings_id: IdType;
  monthly_word_count: number;
  price: number;
}
