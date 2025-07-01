import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface RenameFolderType {
  accountId: IdType;
  folderId: IdType;
  newName: string;
  user: UserPayload;
}
