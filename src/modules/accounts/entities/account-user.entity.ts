import { Column, DeleteDateColumn, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { UserEntity } from 'modules/users/entities/user.entity';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { RoleEntity } from 'modules/users/entities/role.entity';

@Entity('account_users')
@Unique('account_user', ['account', 'user'])
export class AccountUserEntity extends BaseEntity {
  @DeleteDateColumn({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @ManyToOne(() => UserEntity, { nullable: false })
  user: UserEntity;

  @ManyToOne(() => AccountEntity, { nullable: false, onDelete: 'CASCADE' })
  account: AccountEntity;

  @ManyToOne(() => RoleEntity, { eager: true })
  role: RoleEntity;

  @Column({ type: 'boolean', default: false })
  byDefault: boolean;
}
