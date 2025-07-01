import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { Entity } from 'typeorm';

@Entity('subscription_statuses')
export class SubscriptionStatusEntity extends BaseEnumEntity<SubscriptionStatusesEnum> {}
