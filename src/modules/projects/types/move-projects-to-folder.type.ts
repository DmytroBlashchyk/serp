import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface MoveProjectsToFolderType {
  accountId: IdType;
  folderId: IdType;
  projectIds: IdType[];
  user: UserPayload;
}
