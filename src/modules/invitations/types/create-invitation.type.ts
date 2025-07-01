import { IdType } from 'modules/common/types/id-type.type';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserPayload } from 'modules/common/types/user-payload.type';

export class CreateInvitationType {
  email: string;
  accountId: IdType;
  roleName: RoleEnum;
  folderIds: IdType[];
  projectIds: IdType[];
  admin: UserPayload;
}
