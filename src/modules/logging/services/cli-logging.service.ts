import { LoggingService } from 'modules/logging/services/logging.service';
import { Injectable } from '@nestjs/common';
import { SentryLoggingService } from 'modules/logging/services/sentry-logging.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class CliLoggingService extends LoggingService {
  constructor(private readonly sentryLoggingService: SentryLoggingService) {
    super();
  }
  /**
   * Logs the provided data to the console.
   *
   * @param {...unknown} data - The data to be logged.
   * @return {void} No return value.
   */
  log(...data: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(...data);
  }

  error(message: any, trace?: string, context?: string) {
    super.error(message, trace, context);
    this.sentryLoggingService.error(message, trace, context);
  }

  /**
   * Logs debugging information to the console.
   *
   * @param {...unknown} data - The data that should be logged to the console. Can include any number of arguments of any type.
   * @return {void} This method does not return a value.
   */
  debug(...data: unknown[]): void {
    // eslint-disable-next-line no-console
    console.debug(...data);
  }

  sendSentryCaptureMessage(payload: {
    name: string;
    extraData: any;
    visibleFiltered?: boolean;
  }): void | string {
    return payload.visibleFiltered
      ? Sentry.withScope((scope) => {
          scope.setLevel(Sentry.Severity.Info);
          scope.setExtra('extraData', payload.extraData);
          Sentry.captureMessage(payload.name);
        })
      : Sentry.captureMessage(payload.name, {
          level: Sentry.Severity.Info,
          extra: {
            ...payload.extraData,
          },
        });
  }
}
