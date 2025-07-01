import { ClassTransformOptions } from 'class-transformer';
import { ClassSerializerInterceptor, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const classToPlainOptions: ClassTransformOptions = {
  excludeExtraneousValues: true,
  excludePrefixes: ['_'],
};

export const useSerialization = (app: INestApplication) => {
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), classToPlainOptions),
  );
};
