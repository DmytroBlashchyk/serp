import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface GetKeywordType {
  accountId: IdType;
  keywordId: IdType;
  user: UserPayload;
}
