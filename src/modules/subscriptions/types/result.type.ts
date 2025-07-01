import { ImmediatePaymentActionsEnum } from 'modules/subscriptions/enums/immediate-payment-actions.enum';

export interface ResultType {
  action: ImmediatePaymentActionsEnum;
  amount: number;
  currency_code: string;
}
