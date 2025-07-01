import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

import { RawResponseType } from 'modules/common/types/response.type';
import { ErrorPayload } from 'modules/common/types/error-payload.type';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse() as RawResponseType;

    if (exception.message.includes('violates foreign key constraint')) {
      response.status(400).json({
        message: exception.message,
        isNotHumanreadable: true,
      } as ErrorPayload);
    } else if (exception.message.includes('violates unique constraint')) {
      response.status(400).json({
        message: 'Entry you are trying to insert already exists.',
        details: exception.message,
        isNotHumanreadable: false,
      } as ErrorPayload);
    } else {
      response.status(500).json({
        message: 'Internal Server Error',
        isNotHumanreadable: false,
      } as ErrorPayload);
    }
  }
}
