import { INestApplication } from '@nestjs/common';

export const useCors = (app: INestApplication) => {
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
};
