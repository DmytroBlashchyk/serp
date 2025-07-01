export class SubscriptionUpdatedEvent {
  readonly subscriptionId: string;
  constructor(data: SubscriptionUpdatedEvent) {
    Object.assign(this, data);
  }
}
