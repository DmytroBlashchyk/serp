import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TransactionStatusEntity } from 'modules/transactions/entities/transaction-status.entity';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';

@Entity('transactions')
export class TransactionEntity extends BaseEntity {
  @ManyToOne(() => TransactionStatusEntity)
  status: TransactionStatusEntity;

  @Column({ type: 'text', nullable: true })
  subscription_id?: string;

  @Column({ type: 'text', unique: true })
  transactionId: string;

  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  account: AccountEntity;

  @Column({ type: 'float', default: 0 })
  amount: number;

  @ManyToOne(() => TariffPlanSettingEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  tariffPlanSetting: TariffPlanSettingEntity;
}
