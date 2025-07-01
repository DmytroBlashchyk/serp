import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface ChangeAccountEmailType {
  accountId: IdType;
  user: UserPayload;
  newEmail: string;
  currentEmail: string;
  confirmationPassword?: string;
}
