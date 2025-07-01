export class TransactionPaymentFailedCommand {
  constructor(public readonly transactionId: string) {}
}
