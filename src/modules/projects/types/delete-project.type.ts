import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export class DeleteProjectType {
  accountId: IdType;
  projectId: IdType;
  user: UserPayload;
}
