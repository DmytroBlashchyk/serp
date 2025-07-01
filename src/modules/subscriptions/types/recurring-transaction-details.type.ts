import { TotalsType } from 'modules/subscriptions/types/totals.type';

export interface RecurringTransactionDetailsType {
  tax_rates_used: any;
  totals: TotalsType;
  line_items: any;
}
