import { Entity, OneToMany } from 'typeorm';
import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';

@Entity({ name: 'roles' })
export class RoleEntity extends BaseEnumEntity<RoleEnum> {
  @OneToMany(() => AccountUserEntity, (accountUser) => accountUser.role, {
    lazy: true,
  })
  accountUser: AccountUserEntity[];
}
