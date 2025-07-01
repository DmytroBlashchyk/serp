export class SubscriptionCanceledEvent {
  readonly subscriptionId: string;

  constructor(data: SubscriptionCanceledEvent) {
    Object.assign(this, data);
  }
}
