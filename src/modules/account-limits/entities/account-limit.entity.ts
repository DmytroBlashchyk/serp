import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';

@Entity('account_limits')
@Unique('account_limit_type', ['account', 'accountLimitType'])
export class AccountLimitEntity extends BaseEntity {
  @ManyToOne(() => AccountEntity, { onDelete: 'CASCADE' })
  account: AccountEntity;

  @ManyToOne(() => LimitTypeEntity)
  accountLimitType: LimitTypeEntity;

  @Column({ type: 'numeric', default: 0 })
  limit: number;
}
