import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { Request } from 'modules/common/types/request.type';

export const UserToken = createParamDecorator(
  (_, context: ExecutionContext): SerpnestUserTokenData => {
    return (context.switchToHttp().getRequest() as Request).tokenData;
  },
);
