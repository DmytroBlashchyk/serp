import { IdType } from 'modules/common/types/id-type.type';

export interface SearchResultsType {
  keywordId: IdType;
  accountId: IdType;
  userId?: IdType;
}
