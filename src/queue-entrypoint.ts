import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import { NestFactory } from '@nestjs/core';
import { QueueModule } from 'modules/queue/queue.module';
import { ConfigService } from '@nestjs/config';
import { useLogging } from 'modules/app/global-middlewares/useLogging';
import { useMaxEventListeners } from 'modules/app/global-middlewares/useMaxEventListeners';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';

initializeTransactionalContext();
/**
 * Initializes and starts the application by creating an instance of the QueueModule,
 * setting up the necessary configurations such as logging and maximum event listeners,
 * and listening on the port specified in the configuration.
 *
 * @return {Promise<void>} A promise that resolves when the application is successfully started.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(QueueModule);
  const configService = app.get(ConfigService);
  useLogging(app);
  useMaxEventListeners(200);

  await app.listen(configService.get<number>(ConfigEnvEnum.QUEUE_PORT));
}

bootstrap();
