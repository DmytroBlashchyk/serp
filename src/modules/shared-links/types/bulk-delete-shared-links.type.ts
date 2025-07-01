import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface BulkDeleteSharedLinksType {
  accountId: IdType;
  sharedLinkIds: IdType[];
  user: UserPayload;
}
