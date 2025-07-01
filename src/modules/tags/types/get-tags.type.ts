import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface GetTagsType {
  search?: string;
  accountId: IdType;
  user: UserPayload;
}
