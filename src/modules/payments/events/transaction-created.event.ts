import { IdType } from 'modules/common/types/id-type.type';

export class TransactionCreatedEvent {
  readonly accountId: IdType;
  readonly transactionId: string;
  constructor(data: TransactionCreatedEvent) {
    Object.assign(this, data);
  }
}
