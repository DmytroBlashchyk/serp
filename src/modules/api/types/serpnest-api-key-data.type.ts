import { AccountPayload } from 'modules/api/types/account-payload.type';
import { IdType } from 'modules/common/types/id-type.type';

export interface SerpnestApiKeyData {
  account?: AccountPayload;
  iat: number;
  exp: number;
  sub: IdType;
}
