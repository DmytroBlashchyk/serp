export class TransactionCompletedEvent {
  readonly transactionId: string;
  constructor(data: TransactionCompletedEvent) {
    Object.assign(this, data);
  }
}
