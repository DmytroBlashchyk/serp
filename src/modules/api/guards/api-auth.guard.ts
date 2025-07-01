import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'modules/common/types/request.type';
import { ApiService } from 'modules/api/services/api.service';

@Injectable()
export class ApiAuthGuard implements CanActivate {
  constructor(private readonly apiService: ApiService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    try {
      const api_key = request.query.api_key as string;
      if (!api_key) {
        throw new UnauthorizedException('Authentication failed');
      }
      const apiData = await this.apiService.verifyApiKey(api_key);
      if (!apiData || !apiData.account) {
        throw new UnauthorizedException('Authentication failed');
      }
      request.tokenData = apiData;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
