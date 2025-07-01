import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';

export const userPayload = {
  email: 'test@test.com',
  password: 'Qwerty123#',
  username: 'Test',
  tariffPlan: 9,
};

export const userId = '2' as unknown as IdType;

export const account = {
  accountId: '1' as unknown as IdType,
  isMyAccount: true,
  byDefault: true,
  role: { id: '2', name: RoleEnum.Admin },
  owner: {
    id: '2',
    ownerUserLastName: '',
    ownerUserFirstName: 'Test',
    ownerEmail: 'test@test.com',
  },
  invited: {
    id: '2',
    invitedEmail: 'test@test.com',
    invitedUserFirstName: 'Test',
    invitedUserLastName: '',
  },
};
