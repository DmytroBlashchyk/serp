export interface ItemType {
  status: string;
  quantity: number;
  recurring: boolean;
  created_at: Date;
  updated_at: Date;
  previously_billed_at: Date;
  next_billed_at: Date;
  trial_dates: any;
  price: any;
}
