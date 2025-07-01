import { IdType } from 'modules/common/types/id-type.type';
import { SerpnestSharedTokenData } from 'modules/common/types/serpnest-shared-token-data.type';

export interface GetSharedKeywordType {
  link: string;
  keywordId: IdType;
  tokenData: SerpnestSharedTokenData;
}
