import { IdType } from 'modules/common/types/id-type.type';

export class SubscriptionDeactivationEvent {
  readonly subscriptionIds: IdType[];
  constructor(data: SubscriptionDeactivationEvent) {
    Object.assign(this, data);
  }
}
