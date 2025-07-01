import { HttpModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchRepository } from 'modules/batches/repositories/batch.repository';
import { BatchesService } from 'modules/batches/services/batches.service';
import { AdditionalServicesModule } from 'modules/additional-services/additional-services.module';
import { BatchesController } from 'modules/batches/controllers/batches.controller';
import { BatchStartPeriodsService } from 'modules/batches/services/batch-start-periods.service';
import { BatchStartPeriodsRepository } from 'modules/batches/repositories/batch-start-periods.repository';
import { CheckFrequencyModule } from 'modules/check-frequency/check-frequency.module';
import { CacheModule } from 'modules/cache/cache.module';
import { CompetitorsModule } from 'modules/competitors/competitors.module';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { KeywordRankingsResponseFactory } from 'modules/keywords/factories/keyword-rankings-response.factory';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { redisFactory } from 'modules/common/utils/redisFactory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchRepository,
      BatchStartPeriodsRepository,
      KeywordRepository,
      ProjectRepository,
    ]),
    AdditionalServicesModule,
    CheckFrequencyModule,
    CacheModule,
    HttpModule,
    CompetitorsModule,
    GatewayModule,
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
      name: Queues.Triggers,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
  ],
  controllers: [BatchesController],
  providers: [
    BatchesService,
    BatchStartPeriodsService,
    KeywordRankingsResponseFactory,
  ],
  exports: [BatchesService],
})
export class BatchesModule {}
