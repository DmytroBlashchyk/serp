import { UserStatusEnum } from 'modules/users/enums/user-status.enum';

export const mockUserStatusRepository = {
  getStatusByName: jest.fn().mockImplementation((status: UserStatusEnum) => {
    if (status === UserStatusEnum.Activated) {
      return { id: 1, name: UserStatusEnum.Activated };
    } else if (status === UserStatusEnum.Deactivated) {
      return {
        id: 2,
        name: UserStatusEnum.Deactivated,
      };
    } else {
      return null;
    }
  }),
};
