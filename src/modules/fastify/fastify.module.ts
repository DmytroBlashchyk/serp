import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvValidationSchema } from 'modules/common/utils/joi-validation-for-env';
import { LoggingModule } from 'modules/logging/logging.module';
import { KeywordUpdatingController } from 'modules/fastify/controllers/keyword-updating.controller';
import { KeywordUpdatingService } from 'modules/fastify/services/keyword-updating.service';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { typeormFactory } from 'modules/common/utils/typeormFactory';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { TriggersSaga } from 'modules/triggers/sagas/triggers.saga';
import { CreateTriggerInitializationCommandHandler } from 'modules/triggers/command-handlers/create-trigger-initialization.command-handler';
import { TriggerKeywordRepository } from 'modules/triggers/repositories/trigger-keyword.repository';
import { SubscriptionRepository } from 'modules/subscriptions/repositories/subscription.repository';
import { SubscriptionStatusRepository } from 'modules/subscriptions/repositories/subscription-status.repository';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { AccountLimitRepository } from 'modules/account-limits/repositories/account-limit.repository';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { TransactionRepository } from 'modules/transactions/repositories/transaction.repository';
import { TransactionStatusRepository } from 'modules/transactions/repositories/transaction-status.repository';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { CardRepository } from 'modules/transactions/repositories/card.repository';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { BullModule } from '@nestjs/bull';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { App } from 'modules/queue/enums/app.enum';
import { Queues } from 'modules/queue/enums/queues.enum';
import { HealthControllers } from 'modules/fastify/controllers/health.controllers';

/**
 * An array of command handler instances responsible for processing
 * specific commands within the application.
 *
 * The handlers in the array are expected to follow a consistent interface
 * for handling commands, enabling modular command processing and
 * extensibility through the addition of new command handlers.
 *
 * @type {Array} - An array containing instances of command handlers
 */
const commandHandlers = [CreateTriggerInitializationCommandHandler];
/**
 * The FastifyModule is a custom NestJS module that provides configuration for various components like
 * TypeORM, Bull queues, and other micro-services used in the application.
 *
 * This module includes:
 *
 * - `ConfigModule`: This module is used to load environment variables into the application. It is marked as global,
 *   making the configuration available across the entire application.
 * - `TypeOrmModule`: This module is configured for asynchronous loading of TypeORM (the ORM used for interacting with databases),
 *   with configurations provided via a factory function `typeormFactory`. It also includes configuration for various repositories.
 * - `LoggingModule`: This module is used for logging purposes within the application.
 * - `CqrsModule`: A module that integrates CQRS (Command Query Responsibility Segregation) patterns.
 * - `AccountLimitsModule`: Custom module to handle account limits.
 * - `BullModule`: This module is configured for asynchronous loading of Bull queues (used for queue handling and background job
 *   processing) with the configurations provided via a factory pattern. Two queues are registered under the names `App.Keywords`
 *   and `Queues.Projects`.
 *
 * The controllers and providers used within this module are:
 *
 * - `KeywordUpdatingController`: Controller that handles HTTP requests related to keyword updates.
 * - `KeywordUpdatingService`: Service layer that contains the business logic for handling keyword updates.
 * - `DataForSeoService`: Service that interacts with the DataForSeo platform.
 * - `TriggersSaga`: Saga pattern for managing long-running and stateful business processes.
 * - `commandHandlers`: Handlers for executing commands under CQRS patterns.
 *
 * The onModuleInit lifecycle hook is used to log the initialization of the Fastify thread with the process ID.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: EnvValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeormFactory,
      inject: [ConfigService],
    }),
    LoggingModule,
    CqrsModule,
    AccountLimitsModule,
    TypeOrmModule.forFeature([
      ProjectRepository,
      KeywordRepository,
      KeywordPositionsForDayRepository,
      SearchResultRepository,
      CompetitorKeywordPositionRepository,
      TriggerKeywordRepository,
      SubscriptionRepository,
      SubscriptionStatusRepository,
      TariffPlanSettingRepository,
      AccountLimitRepository,
      DefaultTariffPlanLimitRepository,
      TransactionRepository,
      TransactionStatusRepository,
      AccountRepository,
      CardRepository,
    ]),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: App.Keywords,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Projects,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
  ],
  controllers: [KeywordUpdatingController, HealthControllers],
  providers: [
    KeywordUpdatingService,
    DataForSeoService,
    TriggersSaga,
    ...commandHandlers,
  ],
})
export class FastifyModule {
  onModuleInit() {
    // eslint-disable-next-line no-console
    console.log('Fastify theread is started. PID: ', process.pid);
  }
}
