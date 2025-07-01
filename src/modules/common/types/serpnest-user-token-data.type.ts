import { IdType } from 'modules/common/types/id-type.type';
import { UserPayload } from 'modules/common/types/user-payload.type';

export interface SerpnestUserTokenData {
  user?: UserPayload;
  iat: number;
  exp: number;
  sub: IdType;
}
