import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export class ViewAlertByKeywordsType {
  accountId: IdType;
  accountKeywordId: IdType;
  user: UserPayload;
}
