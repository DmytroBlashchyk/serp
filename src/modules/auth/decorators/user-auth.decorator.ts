import { RoleEnum } from 'modules/auth/enums/role.enum';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserAuthGuard } from 'modules/auth/guards/user-auth.guard';
import { UserRoles } from 'modules/auth/decorators/user-roles.decorator';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function UserAuth(...roles: RoleEnum[]) {
  return applyDecorators(
    UseGuards(UserAuthGuard),
    UserRoles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse(),
  );
}
