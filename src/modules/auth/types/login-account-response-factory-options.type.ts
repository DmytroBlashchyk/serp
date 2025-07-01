import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { UserEntity } from 'modules/users/entities/user.entity';
import { IdType } from 'modules/common/types/id-type.type';

export class LoginAccountResponseFactoryOptionsType {
  userEmail: string;
  userAccounts: AccountUserEntity[];
  user: UserEntity;
  userId: IdType;
}
