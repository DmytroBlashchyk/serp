import { IdType } from 'modules/common/types/id-type.type';

export interface RemoteAccountUserType {
  id: IdType;
  email: string;
  username: string;
  account_id?: IdType;
}
