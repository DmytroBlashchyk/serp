import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormFactory } from 'modules/common/utils/typeormFactory';
import { AuthModule } from 'modules/auth/auth.module';
import { UsersModule } from 'modules/users/users.module';
import { MailingModule } from 'modules/mailing/mailing.module';
import { PostmarkModule } from 'nestjs-postmark';
import { postmarkFactory } from 'modules/common/utils/postmarkFactory';
import { EnvValidationSchema } from 'modules/common/utils/joi-validation-for-env';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { TimezonesModule } from 'modules/timezones/timezones.module';
import { CountriesModule } from 'modules/countries/countries.module';
import { LoggingModule } from 'modules/logging/logging.module';
import { ProjectsModule } from 'modules/projects/projects.module';
import { DeviceTypesModule } from 'modules/device-types/device-types.module';
import { InvitationsModules } from 'modules/invitations/invitations.modules';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { CompetitorsModule } from 'modules/competitors/competitors.module';
import { TagsModule } from 'modules/tags/tags.module';
import { NotesModule } from 'modules/notes/notes.module';
import { LanguagesModule } from 'modules/languages/languages.module';
import { SearchEnginesModule } from 'modules/search-engines/search-engines.module';
import { CheckFrequencyModule } from 'modules/check-frequency/check-frequency.module';
import { GoogleDomainsModule } from 'modules/google-domains/google-domains.module';
import { AdditionalServicesModule } from 'modules/additional-services/additional-services.module';
import { FoldersModule } from 'modules/folders/folders.module';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedLinksModule } from 'modules/shared-links/shared-links.module';
import { EmailReportsModule } from 'modules/email-reports/email-reports.module';
import { ApiModule } from 'modules/api/api.module';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { TriggersModule } from 'modules/triggers/triggers.module';
import { AlertsModule } from 'modules/alerts/alerts.module';
import { VisitorsModule } from 'modules/visitors/visitors.module';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { TransactionsModule } from 'modules/transactions/transactions.module';
import { PaymentsModule } from 'modules/payments/payments.module';
import { KeywordsProcessor } from 'modules/keywords/processors/keywords.processor';
import { BullModule } from '@nestjs/bull';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { RedisSubscriberService } from 'modules/redis/services/redis-subscriber.service';
import { GetPaginatedProjectsAvailableToUserTypeResponseFactory } from 'modules/projects/factories/get-paginated-projects-available-to-user-type-response.factory';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { CacheModule } from 'modules/cache/cache.module';
import { RequestTimingMiddleware } from 'modules/common/middlewares/request-timing.middleware';

/**
 * The AppModule is the root module of the application.
 *
 * This module integrates various feature modules and global configurations necessary
 * for the application's operation. It leverages multiple other modules to provide
 * comprehensive functionality including email services, database connectivity,
 * caching, authentication, and more.
 *
 * The imports array includes several supplementary modules that contribute
 * to different features, such as:
 * - MailingModule: Handles email services.
 * - ConfigModule: Manages configuration settings for the application.
 * - TypeOrmModule: Provides TypeORM database connection setup.
 * - PostmarkModule: Integrates Postmark email service.
 * - BullModule: Registers and configures Bull queues for task processing.
 * - LoggingModule: Facilitates application logging.
 * - AccountsModule, AuthModule, UsersModule, etc.: Other feature modules
 *   offering various services such as authentication, user management,
 *   projects, and more.
 *
 * The providers array lists the custom services used by the application:
 * - KeywordsProcessor: Service to process keywords.
 * - RedisSubscriberService: Service to handle Redis subscriptions.
 * - GetPaginatedProjectsAvailableToUserTypeResponseFactory: Factory to generate paginated project responses.
 * - ProjectPerformanceCacheTransformer: Service to transform project performance for caching purposes.
 */
@Module({
  imports: [
    MailingModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: EnvValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: typeormFactory,
      inject: [ConfigService],
    }),
    PostmarkModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: postmarkFactory,
      inject: [ConfigService],
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: redisFactory,
    }),

    LoggingModule,
    AccountsModule,
    AuthModule,
    UsersModule,
    TimezonesModule,
    CountriesModule,
    TimezonesModule,
    MailingModule,
    DeviceTypesModule,
    ProjectsModule,
    InvitationsModules,
    KeywordsModule,
    TagsModule,
    NotesModule,
    LanguagesModule,
    SearchEnginesModule,
    CheckFrequencyModule,
    CompetitorsModule,
    GoogleDomainsModule,
    AdditionalServicesModule,
    FoldersModule,
    CqrsModule,
    SharedLinksModule,
    EmailReportsModule,
    ApiModule,
    GatewayModule,
    SubscriptionsModule,
    TriggersModule,
    AlertsModule,
    VisitorsModule,
    AccountLimitsModule,
    TransactionsModule,
    PaymentsModule,
    CacheModule,
  ],
  providers: [
    KeywordsProcessor,
    RedisSubscriberService,
    GetPaginatedProjectsAvailableToUserTypeResponseFactory,
    ProjectPerformanceCacheTransformer,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestTimingMiddleware).forRoutes('*');
  }
}
