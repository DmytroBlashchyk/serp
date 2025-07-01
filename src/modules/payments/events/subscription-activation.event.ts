import { IdType } from 'modules/common/types/id-type.type';

export class SubscriptionActivationEvent {
  readonly accountId: IdType;
  readonly subscriptionId: string;
  readonly customerId: string;
  constructor(data: SubscriptionActivationEvent) {
    Object.assign(this, data);
  }
}
