import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface EditUserType {
  accountId: IdType;
  userId: IdType;
  roleName: RoleEnum;
  folderIds?: IdType[];
  adminPayload: UserPayload;
  projectIds?: IdType[];
}
