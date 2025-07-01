import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface DeletionOfFolderContentsType {
  accountId: IdType;
  folderId: IdType;
  user: UserPayload;
  projectIds?: IdType[];
  folderIds?: IdType[];
}
