import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import type { Request } from 'modules/common/types/request.type';
@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.get<RoleEnum[]>(
      'user-roles',
      context.getHandler(),
    );
    if (!allowedRoles || allowedRoles.length == 0) {
      return true;
    }

    const { tokenData, params }: Request = context.switchToHttp().getRequest();
    if (!tokenData?.user) {
      throw new UnauthorizedException(
        'You need to login to be able to do this action.',
      );
    }
    if (params.id) {
      const account = tokenData.user.accounts.find(
        // @ts-ignore
        (account) => account.id == params.id,
      );
      if (!account) {
        throw new ForbiddenException('Access denied.');
      }
      return allowedRoles.some(
        (allowedRole) => allowedRole === account.role.name,
      );
    } else {
      return true;
    }
  }
}
