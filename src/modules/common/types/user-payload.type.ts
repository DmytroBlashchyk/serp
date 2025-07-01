import { IdType } from 'modules/common/types/id-type.type';
import { UserStatusEnum } from 'modules/users/enums/user-status.enum';
import { RoleEntity } from 'modules/users/entities/role.entity';

export interface Account {
  id: IdType;
  role: RoleEntity;
}
export class UserPayload {
  id: IdType;
  email?: string;
  username?: string;
  accounts: Account[];

  status?: UserStatusEnum;
}
