import { PaymentMethodDetails } from '@paddle/paddle-node-sdk/dist/types/entities/shared/payment-method-details';
import { IdType } from 'modules/common/types/id-type.type';

export class TransactionUpdatedEvent {
  readonly transactionId: string;

  constructor(data: TransactionUpdatedEvent) {
    Object.assign(this, data);
  }
}
