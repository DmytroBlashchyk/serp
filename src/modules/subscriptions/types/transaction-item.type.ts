import { TransactionPriceType } from 'modules/subscriptions/types/transaction-price.type';

export interface TransactionItemType {
  price: TransactionPriceType;
  price_id: string;
  quantity: number;
  proration: any;
}
