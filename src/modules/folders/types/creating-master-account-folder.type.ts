import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { UserEntity } from 'modules/users/entities/user.entity';

export interface CreatingMasterAccountFolderType {
  account: AccountEntity;
  user: UserEntity;
}
