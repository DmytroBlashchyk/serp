import { RequestTimingMiddleware } from 'modules/common/middlewares/request-timing.middleware';
import { UserAuthService } from 'modules/auth/services/user-auth.service';

export const createRequestTimingMiddleware = (
  userAuthService: UserAuthService,
) => {
  return new RequestTimingMiddleware(userAuthService).use.bind(
    new RequestTimingMiddleware(userAuthService),
  );
};
