import { INestApplication } from '@nestjs/common';
import { ValidationPipe } from 'modules/common/pipes/validation-pipe.pipe';

export const useValidation = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe());
};
