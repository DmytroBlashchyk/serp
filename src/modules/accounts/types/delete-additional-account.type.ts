import { UserPayload } from 'modules/common/types/user-payload.type';
import { IdType } from 'modules/common/types/id-type.type';

export interface DeleteAdditionalAccountType {
  user: UserPayload;
  accountId: IdType;
}
