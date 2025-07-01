import { UserEntity } from 'modules/users/entities/user.entity';

export const superAdmin = {
  username: 'Super Admin',
  firstName: 'Super',
  lastName: 'Admin',
  email: process.env.SUPER_ADMIN_EMAIL,
  isEmailConfirmed: true,
} as UserEntity;
