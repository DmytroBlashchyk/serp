export class TransactionReadyEvent {
  readonly transactionId: string;

  constructor(data: TransactionReadyEvent) {
    Object.assign(this, data);
  }
}
