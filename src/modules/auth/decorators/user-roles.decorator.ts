import { RoleEnum } from 'modules/auth/enums/role.enum';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRolesGuard } from 'modules/auth/guards/user-roles.guard';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';

export const UserRoles = (...roles: RoleEnum[]) => {
  return applyDecorators(
    UseGuards(UserRolesGuard),
    SetMetadata('user-roles', roles),
    ApiUnauthorizedResponse,
  );
};
