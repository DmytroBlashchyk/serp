import { IdType } from 'modules/common/types/id-type.type';

export interface GetProjectKeywordsType {
  accountId: IdType;
  projectId: IdType;
  userId?: IdType;
}
