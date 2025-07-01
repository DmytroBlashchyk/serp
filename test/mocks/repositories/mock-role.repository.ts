import { RoleEnum } from 'modules/auth/enums/role.enum';

export const mockRoleRepository = {
  findOne: jest.fn(),
  getRoleByName: jest.fn().mockImplementation((name: RoleEnum) => {
    if (name === RoleEnum.Admin) {
      return {
        id: 1,
        name: RoleEnum.Admin,
      };
    } else if (name === RoleEnum.Addon) {
      return {
        id: 2,
        name: RoleEnum.ViewOnly,
      };
    } else if (name === RoleEnum.ViewOnly) {
      return {
        id: 3,
        name: RoleEnum.ViewOnly,
      };
    }
    return null;
  }),
};
