import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { useLogging } from 'modules/app/global-middlewares/useLogging';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { FastifyModule } from 'modules/fastify/fastify.module';
import { useCors } from 'modules/app/global-middlewares/useCors';
import { ValidationPipe } from '@nestjs/common';
import { useExceptionFilters } from 'modules/app/global-middlewares/useExceptionFilters';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import * as bodyParser from 'body-parser';

initializeTransactionalContext();
/**
 * Initializes and configures the application with necessary middleware, pipes, filters, and logging.
 * Starts the application server on the specified port.
 * @return {Promise<void>} A promise that resolves when the application is successfully started.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(FastifyModule);
  const configService = app.get(ConfigService);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  useCors(app);
  app.useGlobalPipes(new ValidationPipe());
  useExceptionFilters(app);
  useLogging(app);
  await app.listen(
    configService.get<number>(ConfigEnvEnum.FASTIFY_PORT),
    '0.0.0.0',
  );
}

bootstrap();
