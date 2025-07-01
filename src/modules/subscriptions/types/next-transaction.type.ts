import { CurrentBillingPeriodType } from 'modules/subscriptions/types/current-billing-period.type';

export interface NextTransactionType {
  billing_period: CurrentBillingPeriodType;
  details: any;
  adjustments: [];
}
