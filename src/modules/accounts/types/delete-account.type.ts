import { UserPayload } from 'modules/common/types/user-payload.type';
import { IdType } from 'modules/common/types/id-type.type';

export interface DeleteAccountType {
  user: UserPayload;
  reason: string;
  accountId: IdType;
}
