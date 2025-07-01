import { IdType } from 'modules/common/types/id-type.type';
import { RoleEnum } from 'modules/auth/enums/role.enum';

export interface UpdateInvitationType {
  accountId: IdType;
  id: IdType;
  roleName?: RoleEnum;
  folderIds: IdType[];
  projectIds: IdType[];
}
