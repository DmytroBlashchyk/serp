import { IdType } from 'modules/common/types/id-type.type';
import { SharedPayloadType } from 'modules/shared-links/types/shared-payload.type';

export interface SerpnestSharedTokenData {
  shared: SharedPayloadType;
  iat: number;
  exp: number;
  sub: IdType;
}
