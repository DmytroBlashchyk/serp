import { IdType } from 'modules/common/types/id-type.type';

export interface GetNumberOfAvailableKeywordsToUpdateType {
  keywordIds: IdType[];
  accountId: IdType;
  userId: IdType;
}
