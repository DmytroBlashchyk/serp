import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface AddTagsToProjectsType {
  accountId: IdType;
  user: UserPayload;
  projectIds: IdType[];
  tagIds?: IdType[];
  tags?: string[];
}
