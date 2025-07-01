import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiAuthGuard } from 'modules/api/guards/api-auth.guard';

export function ApiAuth() {
  return applyDecorators(UseGuards(ApiAuthGuard));
}
