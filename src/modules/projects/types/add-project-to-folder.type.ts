import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface AddProjectToFolderType {
  accountId: IdType;
  folderId: IdType;
  projectId: IdType;
  user: UserPayload;
}
