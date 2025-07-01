import { NestFactory } from '@nestjs/core';
import { AppModule } from 'modules/app/app.module';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { useCors } from 'modules/app/global-middlewares/useCors';
import { useSwagger } from 'modules/app/global-middlewares/useSwagger';
import { useValidation } from 'modules/app/global-middlewares/useValidation';
import { useLogging } from 'modules/app/global-middlewares/useLogging';
import { useSerialization } from 'modules/app/global-middlewares/useSerialization';
import { useMaxEventListeners } from 'modules/app/global-middlewares/useMaxEventListeners';
import { useExceptionFilters } from 'modules/app/global-middlewares/useExceptionFilters';
import { UserAuthService } from 'modules/auth/services/user-auth.service';
import { createRequestTimingMiddleware } from 'modules/common/middlewares/create-request-timing.middleware';

initializeTransactionalContext();
/**
 * The bootstrap function initializes and configures the application by setting up crucial middleware,
 * handlers, and configurations needed to run the application. It then starts the application server on the
 * specified port.
 *
 * @return {Promise<void>} A promise representing the eventual completion of the asynchronous initialization operations.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  useCors(app);
  useSwagger(app);
  useValidation(app);
  useExceptionFilters(app);
  useLogging(app);
  const userAuthService = app.get(UserAuthService);
  app.use(createRequestTimingMiddleware(userAuthService));
  useSerialization(app);
  useMaxEventListeners(200);

  await app.listen(configService.get<number>(ConfigEnvEnum.APP_PORT));
}
bootstrap();
