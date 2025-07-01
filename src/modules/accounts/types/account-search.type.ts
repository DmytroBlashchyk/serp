import { IdType } from 'modules/common/types/id-type.type';
import { SearchTypeEnum } from 'modules/accounts/enums/search-type.enum';

export interface AccountSearchType {
  id: IdType;
  name: string;
  domain: string;
  keyword_name: string;
  type: SearchTypeEnum;
  project_id: IdType;
}
