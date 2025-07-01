import { IdType } from 'modules/common/types/id-type.type';

export class SubscriptionDeactivationCommand {
  constructor(public readonly subscriptionIds: IdType[]) {}
}
