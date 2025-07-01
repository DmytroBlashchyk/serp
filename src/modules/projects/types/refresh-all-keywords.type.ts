import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export class RefreshAllKeywordsType {
  projectIds?: IdType[];

  folderIds?: IdType[];

  accountId: IdType;
  user: UserPayload;
}
