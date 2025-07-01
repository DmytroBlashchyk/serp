import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserAuthService } from 'modules/auth/services/user-auth.service';
import { Reflector } from '@nestjs/core';
import type { Request } from 'modules/common/types/request.type';

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const isAuthOptional = this.reflector.get<boolean>(
      'user-auth-optional',
      context.getHandler,
    );
    try {
      const authHeader = request.headers.authorization;
      const bearer = authHeader.split(' ')[0];
      const token = authHeader.split(' ')[1];
      if (!bearer || !token) {
        throw new UnauthorizedException('Authentication failed');
      }
      const tokenData = await this.userAuthService.verifyAccessToken(token);

      if (!tokenData || !tokenData.user) {
        throw new UnauthorizedException('Authentication failed');
      }
      request.tokenData = tokenData;
      return true;
    } catch (error) {
      if (isAuthOptional) return true;
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
