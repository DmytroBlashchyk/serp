import { applyDecorators, UseGuards } from '@nestjs/common';
import { SharedUserAuthGuard } from 'modules/shared-links/guards/shared-user-auth.guard';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function SharedUserAuth() {
  return applyDecorators(
    UseGuards(SharedUserAuthGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
