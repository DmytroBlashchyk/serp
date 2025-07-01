import { CurrentBillingPeriodType } from 'modules/subscriptions/types/current-billing-period.type';

export interface ImmediateTransactionType {
  billing_period: CurrentBillingPeriodType;
  details: any;
  adjustments: any;
}
