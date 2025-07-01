import { CurrentBillingPeriodType } from 'modules/subscriptions/types/current-billing-period.type';
import { BillingCycleType } from 'modules/subscriptions/types/billing-cycle.type';
import { RecurringTransactionDetailsType } from 'modules/subscriptions/types/recurring-transaction-details.type';
import { NextTransactionType } from 'modules/subscriptions/types/next-transaction.type';
import { ImmediateTransactionType } from 'modules/subscriptions/types/immediate-transaction.type';
import { ItemType } from 'modules/subscriptions/types/item.type';
import { CustomDataType } from 'modules/subscriptions/types/custom-data.type';
import { UpdateSummaryType } from 'modules/subscriptions/types/update-summary.type';

export interface ReviewType {
  status: string;
  customer_id: string;
  address_id: string;
  business_id?: string;
  currency_code: string;
  created_at: Date;
  updated_at: Date;
  started_at: Date;
  first_billed_at: Date;
  next_billed_at: Date;
  paused_at: any;
  canceled_at: any;
  collection_mode: string;
  billing_details: any;
  current_billing_period: CurrentBillingPeriodType;
  billing_cycle: BillingCycleType;
  recurring_transaction_details: RecurringTransactionDetailsType;
  next_transaction: NextTransactionType;
  immediate_transaction: ImmediateTransactionType;
  scheduled_change: any;
  items: ItemType[];
  custom_data: CustomDataType;
  management_urls: any;
  discount: any;
  update_summary: UpdateSummaryType;
}
