import { UserPayload } from 'modules/common/types/user-payload.type';

export interface ChangePasswordType {
  user: UserPayload;
  currentPassword: string;
  newPassword: string;
}
