import { INestApplication } from '@nestjs/common';
import { QueryFailedExceptionFilter } from 'modules/common/exeption-filters/query-failed-exception.filter';
import { EntityNotFoundFilter } from 'modules/common/exeption-filters/entity-not-found.filter';

export const useExceptionFilters = (app: INestApplication) => {
  app.useGlobalFilters(new QueryFailedExceptionFilter());
  app.useGlobalFilters(new EntityNotFoundFilter());
};
