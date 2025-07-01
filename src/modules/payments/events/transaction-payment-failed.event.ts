export class TransactionPaymentFailedEvent {
  readonly transactionId: string;
  constructor(data: TransactionPaymentFailedEvent) {
    Object.assign(this, data);
  }
}
