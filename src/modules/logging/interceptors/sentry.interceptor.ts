import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SentryLoggingService } from 'modules/logging/services/sentry-logging.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'modules/common/types/request.type';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  /**
   * Constructs an instance of the class.
   *
   * @param {SentryLoggingService} sentryService - The SentryLoggingService instance used for logging.
   */
  constructor(private readonly sentryService: SentryLoggingService) {}

  /**
   * Intercepts the HTTP request and handles any exceptions that occur during the request processing.
   * If an exception is detected, it captures and logs the exception details using Sentry.
   *
   * @param {ExecutionContext} context - The execution context which provides information about the current request being processed.
   * @param {CallHandler<any>} next - The call handler which represents the next interceptor or the final method call.
   * @return {Observable<any>} An Observable that allows further processing of the request.
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      tap(null, (exception) => {
        if (
          exception instanceof HttpException &&
          exception.getStatus() < HttpStatus.INTERNAL_SERVER_ERROR
        ) {
          return;
        }
        this.sentryService.sentryInstance().captureException(exception, {
          extra: {
            exception,
            body: request?.body,
            route: request?.route,
            user: request?.tokenData?.user,
          },
        });
      }),
    );
  }
}
