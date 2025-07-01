import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'modules/common/types/request.type';
import { SerpnestApiKeyData } from 'modules/api/types/serpnest-api-key-data.type';

export const ApiToken = createParamDecorator(
  (_, context: ExecutionContext): SerpnestApiKeyData => {
    return (context.switchToHttp().getRequest() as Request).tokenData;
  },
);
