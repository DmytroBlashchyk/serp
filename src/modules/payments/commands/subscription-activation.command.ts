import { IdType } from 'modules/common/types/id-type.type';

export class SubscriptionActivationCommand {
  constructor(
    public readonly accountId: IdType,
    public readonly subscriptionId: string,
    public readonly customerId: string,
  ) {}
}
