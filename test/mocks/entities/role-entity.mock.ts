import { RoleEntity } from 'modules/users/entities/role.entity';
import { RoleEnum } from 'modules/auth/enums/role.enum';

export const roleAdminEntityMock = {
  id: 1,
  name: RoleEnum.Admin,
  accountUser: [],
} as RoleEntity;
