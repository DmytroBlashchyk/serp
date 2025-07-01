import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { CardEntity } from 'modules/transactions/entities/card.entity';
import { PaymentMethodEntity } from 'modules/payments/entities/payment-method.entity';

@Entity('subscriptions')
export class SubscriptionEntity extends BaseEntity {
  @ManyToOne(() => TariffPlanSettingEntity)
  tariffPlanSetting: TariffPlanSettingEntity;

  @ManyToOne(() => SubscriptionStatusEntity)
  status: SubscriptionStatusEntity;

  @Column({ type: 'timestamptz', nullable: true })
  activationDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  statusUpdateDate?: Date;

  @Column({ type: 'text', nullable: true })
  subscriptionId: string;

  @Column({ type: 'text', nullable: true })
  customerId?: string;

  @ManyToOne(() => CardEntity, { nullable: true })
  card?: CardEntity;

  @ManyToOne(() => PaymentMethodEntity, { nullable: true })
  paymentMethod?: PaymentMethodEntity;
}
