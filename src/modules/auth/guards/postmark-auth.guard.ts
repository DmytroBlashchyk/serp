import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';

@Injectable()
export class PostmarkAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,

    private readonly cliLoggingService: CliLoggingService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // for testing
    this.cliLoggingService.sendSentryCaptureMessage({
      name: 'PostmarkAuthGuard canActivate',
      extraData: { headers: JSON.stringify(request?.headers) },
      visibleFiltered: true,
    });

    return (
      request?.headers?.connect_authorization_token ===
      this.configService.get(ConfigEnvEnum.POSTMARK_AUTHORIZATION_TOKEN)
    );
  }
}
