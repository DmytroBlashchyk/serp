import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface MoveFoldersType {
  accountId: IdType;
  folderId: IdType;
  user: UserPayload;
  destinationFolderId: IdType;
}
