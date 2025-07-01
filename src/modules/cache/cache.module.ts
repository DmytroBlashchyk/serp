import { CacheModule as Cache, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { RedisCacheService } from 'modules/cache/services/redis-cache.service';
import { OverviewCacheTransformer } from 'modules/cache/transformers/overview.cache-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { LoggingModule } from 'modules/logging/logging.module';
import { ImprovedVsDeclinedCacheTransformer } from 'modules/cache/transformers/improved-vs-declined.cache-transformer';
import { KeywordTrendsCacheTransformer } from 'modules/cache/transformers/keyword-trends.cache-transformer';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { CompetitorProjectPerformanceCacheTransformer } from 'modules/cache/transformers/competitor-project-performance.cache-transformer';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { CompetitorRepository } from 'modules/competitors/repositories/competitor.repository';
import { PositionHistoryCacheTransformer } from 'modules/cache/transformers/position-history.cache-transformer';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { CompetitorProjectPositionHistoryCacheTransformer } from 'modules/cache/transformers/competitor-project-position-history.cache-transformer';

/**
 * Array of cache transformers.
 *
 * The `transformers` array contains a collection of specific cache transformer classes.
 * Each transformer is responsible for transforming and caching different sets of data
 * based on the type and requirements of the application.
 *
 * - ImprovedVsDeclinedCacheTransformer: Handles caching improvements vs declined metrics.
 * - OverviewCacheTransformer: Manages overview-related cache transformations.
 * - KeywordTrendsCacheTransformer: Transforms and caches keyword trends data.
 * - ProjectPerformanceCacheTransformer: Deals with project performance metrics caching.
 * - CompetitorProjectPerformanceCacheTransformer: Manages caching of competitor project performance data.
 * - PositionHistoryCacheTransformer: Handles transformations and caching of position history data.
 * - CompetitorProjectPositionHistoryCacheTransformer: Manages caching of competitor project position history.
 *
 * These transformers ensure efficient data retrieval and enhance performance by reducing redundant computations.
 *
 * @type {Array<Function>}
 */
const transformers = [
  ImprovedVsDeclinedCacheTransformer,
  OverviewCacheTransformer,
  KeywordTrendsCacheTransformer,
  ProjectPerformanceCacheTransformer,
  CompetitorProjectPerformanceCacheTransformer,
  PositionHistoryCacheTransformer,
  CompetitorProjectPositionHistoryCacheTransformer,
];
/**
 * The CacheModule class is responsible for configuring the caching mechanism within the application.
 * This module imports the necessary TypeORM repositories and the LoggingModule for logging purposes.
 * It also registers the cache asynchronously and configures it to use Redis as the caching store.
 * The cache configuration values such as the host, port, and TTL (time-to-live) are fetched from the configuration service.
 *
 * The module provides and exports the RedisCacheService and any additional transformers defined in the providers.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      KeywordRepository,
      LatestProjectOverviewRepository,
      ProjectRepository,
      CompetitorKeywordPositionRepository,
      CompetitorRepository,
      KeywordPositionsForDayRepository,
    ]),
    LoggingModule,
    Cache.registerAsync({
      imports: [CacheModule],
      useFactory: (config: ConfigService) => {
        return {
          store: redisStore,
          host: config.get(ConfigEnvEnum.REDIS_HOST),
          port: config.get(ConfigEnvEnum.REDIS_PORT),
          ttl: 60 * 3600 * 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService, ...transformers],
  exports: [RedisCacheService, ...transformers],
})
export class CacheModule {}
