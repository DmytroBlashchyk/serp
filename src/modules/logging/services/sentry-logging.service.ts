import { LoggingService } from 'modules/logging/services/logging.service';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { Environments } from 'modules/common/enums/environments.enum';
import * as Sentry from '@sentry/node';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SentryLoggingService extends LoggingService {
  private readonly IS_DEBUG_ENABLED: boolean;
  constructor(private readonly configService: ConfigService) {
    super();
    this.IS_DEBUG_ENABLED =
      configService.get(ConfigEnvEnum.NODE_ENV) === Environments.Development;
  }

  /**
   * Logs an error message with optional trace and context information.
   *
   * @param {any} message - The error message to be logged.
   * @param {string} [trace] - Additional trace information that can help in debugging.
   * @param {string} [context] - The context in which the error occurred.
   * @return {void} This method does not return a value.
   */
  error(message: any, trace?: string, context?: string): void {
    if (trace) {
      Sentry.setExtra('trace', trace);
    }
    Sentry.captureException(message);
  }

  /**
   * Logs the provided message to Sentry with an optional context.
   *
   * @param {any} message - The message to log.
   * @param {string} [context] - Optional context to provide additional information about the log.
   * @return {void}
   */
  log(message: any, context?: string): void {
    Sentry.addBreadcrumb({ message });
  }

  /**
   * Logs a warning message and adds it to the Sentry breadcrumb.
   *
   * @param message - The warning message to log.
   * @param context - Optional. The context or additional information about where the warning occurred.
   * @return void
   */
  warn(message: any, context?: string): void {
    Sentry.addBreadcrumb({ message });
  }

  /**
   * Logs a debug message if debugging is enabled.
   *
   * @param {any} message - The debug message to log.
   * @param {string} [context] - Optional context for the debug message.
   * @return {void}
   */
  debug(message: any, context?: string): void {
    if (!this.IS_DEBUG_ENABLED) return;

    Sentry.addBreadcrumb({ message });
  }

  /**
   * Logs a verbose message to Sentry with an optional context.
   *
   * @param {any} message - The message or object to be logged.
   * @param {string} [context] - An optional context to provide additional information about the message.
   * @return {void} This function does not return a value.
   */
  verbose(message: any, context?: string): void {
    Sentry.addBreadcrumb({ message });
  }

  /**
   * Retrieves the current instance of Sentry.
   *
   * @return {Object} The current Sentry instance.
   */
  sentryInstance() {
    return Sentry;
  }
}
