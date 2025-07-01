import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { Environments } from 'modules/common/enums/environments.enum';
import * as Sentry from '@sentry/node';

import { HttpAdapterHost } from '@nestjs/core';
import { SentryFilter } from 'modules/logging/filters/sentry.filter';

export const useLogging = (app: INestApplication | NestFastifyApplication) => {
  const configService = app.get(ConfigService);
  if (
    [
      Environments.Staging,
      Environments.Development,
      Environments.Production,
    ].includes(configService.get(ConfigEnvEnum.ENVIRONMENT))
  ) {
    Sentry.init({
      dsn: configService.get<string>(ConfigEnvEnum.SENTRY_DNS),
      serverName: configService.get(ConfigEnvEnum.APP_BACKEND_URL),
      environment: configService.get<string>(ConfigEnvEnum.ENVIRONMENT),
      tracesSampleRate: 1.0,
      integrations: [new Sentry.Integrations.Http({ tracing: true })],
    });

    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new SentryFilter(httpAdapter));
  }
};
