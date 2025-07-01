import { Module } from '@nestjs/common';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { ProjectsController } from 'modules/projects/controllers/projects.controller';
import { DeviceTypesModule } from 'modules/device-types/device-types.module';
import { SearchEnginesModule } from 'modules/search-engines/search-engines.module';
import { CheckFrequencyModule } from 'modules/check-frequency/check-frequency.module';
import { LanguagesModule } from 'modules/languages/languages.module';
import { CountriesModule } from 'modules/countries/countries.module';
import { UsersModule } from 'modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { TagsModule } from 'modules/tags/tags.module';
import { CompetitorsModule } from 'modules/competitors/competitors.module';
import { NotesModule } from 'modules/notes/notes.module';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { GetPaginatedProjectsAvailableToUserTypeResponseFactory } from 'modules/projects/factories/get-paginated-projects-available-to-user-type-response.factory';
import { GoogleDomainsModule } from 'modules/google-domains/google-domains.module';
import { AdditionalServicesModule } from 'modules/additional-services/additional-services.module';
import { ProjectUrlTypeRepository } from 'modules/projects/repositories/project-url-type.repository';
import { ProjectUrlTypesService } from 'modules/projects/services/project-url-types.service';
import { ProjectUrlTypesController } from 'modules/projects/controllers/project-url-types.controller';
import { FoldersModule } from 'modules/folders/folders.module';
import { ProjectOverviewFactory } from 'modules/projects/factories/project-overview.factory';
import { ImprovedVsDeclinedFactory } from 'modules/projects/factories/improved-vs-declined.factory';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateKeywordsSage } from 'modules/projects/sagas/create-keywords.sage';
import { CreateKeywordCommandHandler } from 'modules/projects/command-handlers/create-keyword.command-handler';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { ProjectInfoResponseFactory } from 'modules/projects/factories/project-info-response.factory';
import { KeywordTrendsResponseFactory } from 'modules/projects/factories/keyword-trends-response.factory';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { UpdateDataFromDataForSeoForAllKeywordsOfProjectSaga } from 'modules/projects/sagas/update-data-from-data-for-seo-for-all-keywords-of-project.saga';
import { UpdateDataFromDataForSeoForAllKeywordsOfProjectCommandHandler } from 'modules/projects/command-handlers/update-data-from-data-for-seo-for-all-keywords-of-project.command-handler';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { CacheModule } from 'modules/cache/cache.module';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { LoggingModule } from 'modules/logging/logging.module';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { ProjectsSaga } from 'modules/projects/sagas/projects.saga';
import { RemoteProjectsCommandHandler } from 'modules/projects/command-handlers/remote-projects.command-handler';
import { DeleteProjectsCommandHandler } from 'modules/projects/command-handlers/delete-projects.command-handler';
import { DetermineNumberOfAccountProjectsCommandHandler } from 'modules/projects/command-handlers/determine-number-of-account-projects.command-handler';
import { ListAvailableProjectsResponseFactory } from 'modules/projects/factories/list-available-projects-response.factory';
import { CreateKeywordsForGoogleLocalCommandHandler } from 'modules/projects/command-handlers/create-keywords-for-google-local.command-handler';
import { CreateKeywordsForBaiduCommandHandler } from 'modules/projects/command-handlers/create-keywords-for-baidu.command-handler';
import { CreateKeywordsForBingCommandHandler } from 'modules/projects/command-handlers/create-keywords-for-bing.command-handler';
import { CreateKeywordsForGoogleMapsCommandHandler } from 'modules/projects/command-handlers/create-keywords-for-google-maps.command-handler';
import { CreateKeywordsForYahooCommandHandler } from 'modules/projects/command-handlers/create-keywords-for-yahoo.command-handler';
import { CreateKeywordsForYoutubeCommandHandler } from 'modules/projects/command-handlers/create-keywords-for-youtube.command-handler';
import { UpdateDataForProjectsCommandHandler } from 'modules/projects/command-handlers/update-data-for-projects.command-handler';
import { RedisPublisherService } from 'modules/redis/services/redis-publisher.service';
import { DeleteAssignedProjectsCommandHandler } from 'modules/projects/command-handlers/delete-assigned-projects.command-handler';
import { CreateProjectResponseFactory } from 'modules/projects/factories/create-project-response.factory';
import { CsvEmailReportTransformer } from 'modules/email-reports/transformers/csv-email-report.transformer';
import { CsvService } from 'modules/email-reports/services/csv.service';

/**
 * A collection of command handler classes responsible for various operations
 * like creating keywords for different platforms, deleting projects, updating
 * data from DataForSEO, and more.
 *
 * @type {Array<Function>}
 * @see CreateKeywordCommandHandler
 * @see CreateKeywordsForGoogleLocalCommandHandler
 * @see CreateKeywordsForBaiduCommandHandler
 * @see CreateKeywordsForBingCommandHandler
 * @see CreateKeywordsForGoogleMapsCommandHandler
 * @see CreateKeywordsForYahooCommandHandler
 * @see CreateKeywordsForYoutubeCommandHandler
 * @see DeleteAssignedProjectsCommandHandler
 * @see UpdateDataFromDataForSeoForAllKeywordsOfProjectCommandHandler
 * @see RemoteProjectsCommandHandler
 * @see DeleteProjectsCommandHandler
 * @see DetermineNumberOfAccountProjectsCommandHandler
 * @see UpdateDataForProjectsCommandHandler
 */
const commandHandlers = [
  CreateKeywordCommandHandler,
  CreateKeywordsForGoogleLocalCommandHandler,
  CreateKeywordsForBaiduCommandHandler,
  CreateKeywordsForBingCommandHandler,
  CreateKeywordsForGoogleMapsCommandHandler,
  CreateKeywordsForYahooCommandHandler,
  CreateKeywordsForYoutubeCommandHandler,
  DeleteAssignedProjectsCommandHandler,
  UpdateDataFromDataForSeoForAllKeywordsOfProjectCommandHandler,
  RemoteProjectsCommandHandler,
  DeleteProjectsCommandHandler,
  DetermineNumberOfAccountProjectsCommandHandler,
  UpdateDataForProjectsCommandHandler,
];
/**
 * This module encapsulates the functionality related to projects and their associated services.
 *
 * Imports:
 * - TypeOrmModule: For integrating with the database repositories for Project, ProjectUrlType, and LatestProjectOverview.
 * - DeviceTypesModule: Manages different device types.
 * - SearchEnginesModule: Handles search engine related functionalities.
 * - CheckFrequencyModule: Manages check frequency configurations.
 * - LanguagesModule: Handles various language configurations.
 * - CountriesModule: Manages country-specific configurations.
 * - UsersModule: Manages user-related functionalities.
 * - AccountsModule: Handles account related services.
 * - AccountLimitsModule: Enforces account limits.
 * - TagsModule: Manages tagging functionalities.
 * - CompetitorsModule: Handles competitor-related functionalities.
 * - NotesModule: Manages notes related to projects.
 * - KeywordsModule: Manages keywords and related functionalities.
 * - GoogleDomainsModule: Handles Google domain configurations.
 * - AdditionalServicesModule: Incorporates additional services related to projects.
 * - FoldersModule: Manages folder functionalities.
 * - CqrsModule: Integrates Command Query Responsibility Segregation.
 * - SubscriptionsModule: Manages subscription-related services.
 * - GatewayModule: Integrates gateway-related functionalities.
 * - CacheModule: Manages caching functionalities.
 * - LoggingModule: Provides logging functionalities.
 * - BullModule: For handling job queues, specifically for Triggers, UpdateKeywordPosition, and Projects queues.
 *
 * Providers:
 * - ProjectsService: Service related to project operations.
 * - GetPaginatedProjectsAvailableToUserTypeResponseFactory: Factory for paginated project responses.
 * - ProjectUrlTypesService: Service for managing project URL types.
 * - ProjectOverviewFactory: Factory for creating project overviews.
 * - ImprovedVsDeclinedFactory: Factory for comparing improved vs declined metrics.
 * - CreateKeywordsSage: Sage for creating keywords.
 * - commandHandlers: Set of command handlers related to project functionalities.
 * - ProjectInfoResponseFactory: Factory for creating project info responses.
 * - KeywordTrendsResponseFactory: Factory for creating keyword trends responses.
 * - UpdateDataFromDataForSeoForAllKeywordsOfProjectSaga: Saga for updating keyword data.
 * - ProjectsSaga: Saga encapsulating project-related operations.
 * - ListAvailableProjectsResponseFactory: Factory for listing available projects.
 * - RedisPublisherService: Service for publishing messages to Redis.
 *
 * Exports:
 * - ProjectsService
 * - ProjectInfoResponseFactory
 * - TypeOrmModule: Includes ProjectRepository.
 * - ImprovedVsDeclinedFactory
 * - KeywordTrendsResponseFactory
 *
 * Controllers:
 * - ProjectsController: Handles HTTP requests related to projects.
 * - ProjectUrlTypesController: Manages HTTP requests related to project URL types.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProjectRepository,
      ProjectUrlTypeRepository,
      LatestProjectOverviewRepository,
    ]),
    DeviceTypesModule,
    SearchEnginesModule,
    CheckFrequencyModule,
    LanguagesModule,
    CountriesModule,
    UsersModule,
    AccountsModule,
    AccountLimitsModule,
    TagsModule,
    CompetitorsModule,
    NotesModule,
    KeywordsModule,
    GoogleDomainsModule,
    AdditionalServicesModule,
    FoldersModule,
    CqrsModule,
    SubscriptionsModule,
    GatewayModule,
    CacheModule,
    LoggingModule,
    TagsModule,

    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Triggers,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.UpdateKeywordPosition,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
        defaultJobOptions: {
          priority: 1,
        },
      }),
    }),
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
  providers: [
    ProjectsService,
    GetPaginatedProjectsAvailableToUserTypeResponseFactory,
    ProjectUrlTypesService,
    ProjectOverviewFactory,
    ImprovedVsDeclinedFactory,
    CreateKeywordsSage,
    ...commandHandlers,
    ProjectInfoResponseFactory,
    KeywordTrendsResponseFactory,
    UpdateDataFromDataForSeoForAllKeywordsOfProjectSaga,
    ProjectsSaga,
    ListAvailableProjectsResponseFactory,
    RedisPublisherService,
    CreateProjectResponseFactory,
    CsvEmailReportTransformer,
    CsvService,
  ],
  exports: [
    ProjectsService,
    ProjectInfoResponseFactory,
    TypeOrmModule.forFeature([ProjectRepository]),
    ImprovedVsDeclinedFactory,
    KeywordTrendsResponseFactory,
  ],
  controllers: [ProjectsController, ProjectUrlTypesController],
})
export class ProjectsModule {}
