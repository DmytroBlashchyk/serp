import { IdType } from 'modules/common/types/id-type.type';

export interface GroupedKeywordsByAccountType {
  accountId: IdType;
  keywordIds: IdType[];
}
