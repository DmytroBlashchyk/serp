import type { Request as ExpressRequest } from 'express';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';

export type Request = ExpressRequest & {
  tokenData?: SerpnestUserTokenData;
};
