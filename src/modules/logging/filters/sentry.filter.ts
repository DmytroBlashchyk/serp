import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import * as Sentry from '@sentry/node';

/**
 * A filter that captures unhandled exceptions and reports them to Sentry.
 * Extends from the NestJS `BaseExceptionFilter`.
 *
 * This filter will catch any exceptions thrown during the HTTP request lifecycle,
 * check if it is an instance of `HttpException`, and determine the appropriate status code.
 * If the status code indicates a server error (500 or above), the exception will be sent to Sentry.
 *
 * The filter then delegates to the base class's `catch` method to ensure proper
 * handling and response to the client.
 *
 * @param exception - The exception thrown during request processing.
 * @param host - The arguments host providing access to request and response objects.
 */
@Catch()
export class SentryFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      Sentry.captureException(exception);
    }

    super.catch(exception, host);
  }
}
