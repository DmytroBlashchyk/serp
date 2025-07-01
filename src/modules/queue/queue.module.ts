import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvValidationSchema } from 'modules/common/utils/joi-validation-for-env';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormFactory } from 'modules/common/utils/typeormFactory';
import { RedisModule } from 'nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from 'modules/tasks/tasks.module';
import { LoggingModule } from 'modules/logging/logging.module';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { AuthModule } from 'modules/auth/auth.module';
import { UsersModule } from 'modules/users/users.module';
import { TimezonesModule } from 'modules/timezones/timezones.module';
import { CountriesModule } from 'modules/countries/countries.module';
import { MailingModule } from 'modules/mailing/mailing.module';
import { PostmarkModule } from 'nestjs-postmark';
import { postmarkFactory } from 'modules/common/utils/postmarkFactory';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { Queues } from 'modules/queue/enums/queues.enum';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { UpdateKeywordPositionsQueue } from 'modules/queue/queues/update-keyword-positions.queue';
import { CompetitorsModule } from 'modules/competitors/competitors.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { TriggersQueue } from 'modules/queue/queues/triggers.queue';
import { TriggersModule } from 'modules/triggers/triggers.module';
import { AlertsModule } from 'modules/alerts/alerts.module';
import { DeviceTypesModule } from 'modules/device-types/device-types.module';
import { AdditionalServicesModule } from 'modules/additional-services/additional-services.module';
import { CqrsModule } from '@nestjs/cqrs';
import { MailingQueue } from 'modules/queue/queues/mailing.queue';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { App } from 'modules/queue/enums/app.enum';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisPublisherService } from 'modules/redis/services/redis-publisher.service';
import { ProjectsQueue } from 'modules/queue/queues/projects.queue';
import { CacheModule } from 'modules/cache/cache.module';
import { HealthControllers } from 'modules/queue/controllers/health.controllers';
import { LanguagesModule } from 'modules/languages/languages.module';
import { LocationsQueue } from 'modules/queue/queues/locations.queue';
import { AccountsQueue } from 'modules/queue/queues/accounts.queue';

/**
 * Configures and initializes the Queue module with various services and integrations.
 *
 * The QueueModule includes the configuration for several services and libraries such as
 * ConfigModule, TypeOrmModule, Redis, Bull for task queues, and Postmark for mailing. It integrates
 * various submodules and queues required for handling tasks related to keyword positions, triggers,
 * projects, and more.
 *
 * It also configures the Redis and TypeORM connections asynchronously using factory methods and
 * injects the necessary configurations from the ConfigService. Different queue processors and their
 * priorities are set up for handling different types of jobs.
 *
 * Modules Imported:
 *  - ConfigModule: Used for loading and validating configuration settings
 *  - TypeOrmModule: Sets up TypeORM for database interactions
 *  - ClientsModule: Registers Redis as the transport layer
 *  - RedisModule: Configures Redis connections
 *  - BullModule: Registers various queues for background processing and job management
 *  - PostmarkModule: Configures Postmark for email handling
 *  - Various application-specific modules such as LoggingModule, AccountsModule, AuthModule, etc.
 *
 * Queue Configurations:
 *  - UpdateKeywordPosition queue
 *  - Keywords queue
 *  - Triggers queue
 *  - Projects queue
 *
 * Service Providers:
 *  - UpdateKeywordPositionsQueue
 *  - TriggersQueue
 *  - MailingQueue
 *  - ProjectsQueue
 *  - RedisPublisherService
 *
 * The `onModuleInit` lifecycle hook logs the start of the queue thread along with the process ID.
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
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        },
      },
    ]),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: redisFactory,
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: redisFactory,
    }),
    PostmarkModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: postmarkFactory,
      inject: [ConfigService],
    }),
    LoggingModule,
    AccountsModule,
    AuthModule,
    UsersModule,
    TimezonesModule,
    CountriesModule,
    TimezonesModule,
    MailingModule,
    ScheduleModule.forRoot(),
    TasksModule,
    KeywordsModule,
    CompetitorsModule,
    ProjectsModule,
    TriggersModule,
    DeviceTypesModule,
    AdditionalServicesModule,
    CqrsModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Accounts,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        defaultJobOptions: {
          priority: 2,
        },
        redis: redisFactory(config),
      }),
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.UpdateKeywordPosition,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        defaultJobOptions: {
          priority: 2,
        },
        redis: redisFactory(config),
      }),
    }),
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
      name: Queues.Triggers,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
    AlertsModule,
    AccountLimitsModule,
    LanguagesModule,
    CountriesModule,
    CacheModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Projects,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
        defaultJobOptions: {
          priority: 3,
        },
      }),
    }),
  ],
  controllers: [HealthControllers],
  providers: [
    UpdateKeywordPositionsQueue,
    TriggersQueue,
    MailingQueue,
    ProjectsQueue,
    RedisPublisherService,
    LocationsQueue,
    AccountsQueue,
  ],
  exports: [],
})
export class QueueModule {
  onModuleInit() {
    // eslint-disable-next-line no-console
    console.log('Queue theread is started. PID: ', process.pid);
  }
}
