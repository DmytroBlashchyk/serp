import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { KeywordsController } from 'modules/keywords/controllers/keywords.controller';
import { KeywordPositionRepository } from 'modules/keywords/repositories/keyword-position.repository';
import { KeywordsPositionsService } from 'modules/keywords/services/keywords-positions.service';
import { CompetitorsModule } from 'modules/competitors/competitors.module';
import { ProjectOverviewFactory } from 'modules/projects/factories/project-overview.factory';
import { KeywordRankingsResponseFactory } from 'modules/keywords/factories/keyword-rankings-response.factory';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdateKeywordsPositionsSaga } from 'modules/keywords/sagas/update-keywords.positions.saga';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { SearchResultsResponseFactory } from 'modules/keywords/factories/search-results-response.factory';
import { NotesModule } from 'modules/notes/notes.module';
import { AdditionalServicesModule } from 'modules/additional-services/additional-services.module';
import { SubscriptionsModule } from 'modules/subscriptions/subscriptions.module';
import { AccountsModule } from 'modules/accounts/accounts.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CsvService } from 'modules/email-reports/services/csv.service';
import { UpdateKeywordDataWithDataForSeoCommandHandler } from 'modules/keywords/command-handlers/update-keyword-data-with-data-for-seo.command-handler';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { UpdatingDataForGraphsSaga } from 'modules/keywords/sagas/updating-data-for-graphs.saga';
import { UpdateDataForKeywordRankingsCommandHandler } from 'modules/keywords/command-handlers/update-data-for-keyword-rankings.command-handler';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { UpdateKeywordPositionsUsingStandardQueueCommandHandler } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue.command-handler';
import { CacheModule } from 'modules/cache/cache.module';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { GetPaginatedProjectsAvailableToUserTypeResponseFactory } from 'modules/projects/factories/get-paginated-projects-available-to-user-type-response.factory';
import { DeviceTypesModule } from 'modules/device-types/device-types.module';
import { LoggingModule } from 'modules/logging/logging.module';
import { Queues } from 'modules/queue/enums/queues.enum';
import { StartOfKeywordUpdateCommandHandler } from 'modules/keywords/command-handlers/start-of-keyword-update.command-handler';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { App } from 'modules/queue/enums/app.enum';
import { AdditionOfKeywordsCommandHandler } from 'modules/keywords/command-handlers/addition-of-keywords.command-handler';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommandHandler } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue-for-google-local.command-handler';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleMapsCommandHandler } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue-for-google-maps.command-handler';
import { UpdateKeywordPositionsUsingStandardQueueForYoutubeCommandHandle } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue-for-youtube.command-handler';
import { UpdateKeywordPositionsUsingStandardQueueForBingCommandHandler } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue-for-bing.command-handler';
import { UpdateKeywordPositionsUsingStandardQueueForYahooCommandHandler } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue-for-yahoo.command-handler';
import { UpdateKeywordPositionsUsingStandardQueueForBaiduCommandHandler } from 'modules/keywords/command-handlers/update-keyword-positions-using-standard-queue-for-baidu.command-handler';
import { RedisPublisherService } from 'modules/redis/services/redis-publisher.service';
import { GetCPCAndSearchVolumeCommandHandler } from 'modules/keywords/command-handlers/get-cPC-and-search-volume.command-handler';
import { GetKeywordResponseFactory } from 'modules/keywords/factories/get-keyword-response.factory';
import { KeywordPositionInfoResponseFactory } from 'modules/keywords/factories/keyword-position-info-response.factory';

/**
 * An array of command handler classes used for managing keyword data and positions across various platforms.
 *
 * The commandHandlers array includes a variety of handlers to update keyword data, manage keyword rankings,
 * and update keyword positions across different search engines like Google, Bing, Yahoo, and more.
 *
 * It contains the following command handlers:
 * - UpdateKeywordDataWithDataForSeoCommandHandler
 * - UpdateDataForKeywordRankingsCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueForGoogleMapsCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueForYoutubeCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueForBingCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueForBaiduCommandHandler
 * - UpdateKeywordPositionsUsingStandardQueueForYahooCommandHandler
 * - StartOfKeywordUpdateCommandHandler
 * - AdditionOfKeywordsCommandHandler
 * - GetCPCAndSearchVolumeCommandHandler
 */
const commandHandlers = [
  UpdateKeywordDataWithDataForSeoCommandHandler,
  UpdateDataForKeywordRankingsCommandHandler,
  UpdateKeywordPositionsUsingStandardQueueCommandHandler,
  UpdateKeywordPositionsUsingStandardQueueForGoogleLocalCommandHandler,
  UpdateKeywordPositionsUsingStandardQueueForGoogleMapsCommandHandler,
  UpdateKeywordPositionsUsingStandardQueueForYoutubeCommandHandle,
  UpdateKeywordPositionsUsingStandardQueueForBingCommandHandler,
  UpdateKeywordPositionsUsingStandardQueueForBaiduCommandHandler,
  UpdateKeywordPositionsUsingStandardQueueForYahooCommandHandler,
  StartOfKeywordUpdateCommandHandler,
  AdditionOfKeywordsCommandHandler,
  GetCPCAndSearchVolumeCommandHandler,
];

/**
 * The KeywordsModule class is responsible for providing and managing the necessary dependencies
 * and functionality associated with keyword operations within the application.
 *
 * The module imports several other modules and repositories that are required to handle keyword data,
 * keyword positions, search results, projects, keyword positions for specific days, and latest project overviews.
 *
 * In addition to these imports, the KeywordsModule also registers several queues using the BullModule,
 * which is used for job processing, managing keyword positions, projects, and triggers.
 *
 * The KeywordsModule class provides various services and factories, including the KeywordsService,
 * KeywordsPositionsService, ProjectOverviewFactory, KeywordRankingsResponseFactory, among others.
 * These services are essential for managing keyword data, calculating keyword rankings,
 * generating project overviews, and other related operations.
 *
 * The module also defines a KeywordsController responsible for handling incoming HTTP requests
 * related to keywords.
 *
 * The KeywordsModule exports several services and repositories, ensuring they are available
 * to other modules that import this module.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      KeywordRepository,
      KeywordPositionRepository,
      SearchResultRepository,
      ProjectRepository,
      KeywordPositionsForDayRepository,
      LatestProjectOverviewRepository,
    ]),
    DeviceTypesModule,
    LoggingModule,
    CompetitorsModule,
    CqrsModule,
    NotesModule,
    AdditionalServicesModule,
    SubscriptionsModule,
    AccountsModule,
    GatewayModule,
    CacheModule,
    AccountLimitsModule,

    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.UpdateKeywordPosition,
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
        defaultJobOptions: {
          priority: 3,
        },
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
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: App.Keywords,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
  ],
  providers: [
    KeywordsService,
    KeywordsPositionsService,
    ProjectOverviewFactory,
    KeywordRankingsResponseFactory,
    UpdateKeywordsPositionsSaga,
    UpdatingDataForGraphsSaga,
    ...commandHandlers,
    SearchResultsResponseFactory,
    CsvService,
    GetPaginatedProjectsAvailableToUserTypeResponseFactory,
    RedisPublisherService,
    GetKeywordResponseFactory,
    KeywordPositionInfoResponseFactory,
  ],
  controllers: [KeywordsController],
  exports: [
    KeywordsService,
    KeywordsPositionsService,
    TypeOrmModule.forFeature([KeywordRepository]),
    ProjectOverviewFactory,
    KeywordRankingsResponseFactory,
    SearchResultsResponseFactory,
  ],
})
export class KeywordsModule {}
