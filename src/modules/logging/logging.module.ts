import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from 'modules/logging/services/logging.service';
import * as process from 'process';
import { Environments } from 'modules/common/enums/environments.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { SentryLoggingService } from 'modules/logging/services/sentry-logging.service';

const loggingServiceProvider = {
  provide: LoggingService,
  useClass:
    process.env.NODE_ENV === Environments.Development
      ? CliLoggingService
      : SentryLoggingService,
};
@Module({
  providers: [loggingServiceProvider, SentryLoggingService, CliLoggingService],
  exports: [LoggingService, SentryLoggingService, CliLoggingService],
})
export class LoggingModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    // Sentry.init({
    //   dsn: this.configService.get(ConfigEnvEnum.SENTRY_DNS),
    //   environment: this.configService.get(ConfigEnvEnum.NODE_ENV),
    // });
  }
}
