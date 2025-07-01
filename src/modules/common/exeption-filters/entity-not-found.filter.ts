import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm';

import { RawResponseType } from 'modules/common/types/response.type';
import { ErrorPayload } from 'modules/common/types/error-payload.type';

@Catch(EntityNotFoundError)
export class EntityNotFoundFilter implements ExceptionFilter {
  catch(_: EntityNotFoundError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse() as RawResponseType;

    response.status(404).json({
      message: 'Entry not found.',
      isNotHumanreadable: false,
    } as ErrorPayload);
  }
}
