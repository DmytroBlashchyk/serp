import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface UpdateKeywordPositionsType {
  accountId: IdType;
  projectId: IdType;
  user: UserPayload;
  keywordIds: IdType[];
}
