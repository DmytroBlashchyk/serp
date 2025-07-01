import { RoleEntity } from 'modules/users/entities/role.entity';

export const roles = [
  {
    id: 1,
    name: 'SuperAdmin',
  },
  {
    id: 2,
    name: 'Admin',
  },
  {
    id: 3,
    name: 'Addon',
  },
  {
    id: 4,
    name: 'ViewOnly',
  },
] as RoleEntity[];
