import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'modules/common/types/request.type';
import { SharedLinkRepository } from 'modules/shared-links/repositories/shared-link.repository';
import { UserAuthService } from 'modules/auth/services/user-auth.service';

@Injectable()
export class SharedUserAuthGuard implements CanActivate {
  constructor(
    private readonly sharedLinkRepositories: SharedLinkRepository,
    private readonly userAuthService: UserAuthService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const sharedLink = await this.sharedLinkRepositories.sharedLinkByLink(
      request.params.link,
    );
    if (!sharedLink) {
      throw new NotFoundException('Shared Link not found.');
    }
    if (!sharedLink.enableSharing) {
      throw new ForbiddenException('Link not available.');
    }

    try {
      if (!sharedLink.requirePassword) {
        return true;
      } else {
        const authHeader = request.headers.authorization;
        const bearer = authHeader.split(' ')[0];
        const token = authHeader.split(' ')[1];
        if (!bearer || !token) {
          throw new UnauthorizedException('Authentication failed');
        }
        const tokenData = await this.userAuthService.verifySharedAccess(token);

        if (!tokenData || tokenData?.shared?.password !== sharedLink.password) {
          throw new UnauthorizedException('Authentication failed');
        }
        request.tokenData = tokenData;
        return true;
      }
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
