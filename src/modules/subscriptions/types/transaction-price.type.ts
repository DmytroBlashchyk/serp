export interface TransactionPriceType {
  id: string;
  status: string;
  quantity: any;
  tax_mode: string;
  product_id: string;
  unit_price: any;
  custom_data?: any;
  description: string;
  trial_period?: any;
  billing_cycle: any;
  unit_price_overrides: any;
}
