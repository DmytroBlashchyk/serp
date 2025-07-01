import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageRepository } from 'modules/languages/repositories/language.repository';
import { LanguagesController } from 'modules/languages/controllers/languages.controller';
import { LanguagesService } from 'modules/languages/services/languages.service';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { redisFactory } from 'modules/common/utils/redisFactory';

/**
 * The LanguagesModule is responsible for managing and providing
 * language-related features and services within the application.
 *
 * This module imports the TypeOrmModule to integrate the LanguageRepository
 * for database operations related to languages.
 *
 * It provides the LanguagesService which contains the business logic
 * for handling language data.
 *
 * The module also defines LanguagesController which handles HTTP requests
 * and routes them to the appropriate service methods.
 *
 * Lastly, it exports the LanguagesService to make it available to other
 * modules that import the LanguagesModule.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([LanguageRepository]),
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Languages,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
  ],
  providers: [LanguagesService],
  controllers: [LanguagesController],
  exports: [LanguagesService, TypeOrmModule.forFeature([LanguageRepository])],
})
export class LanguagesModule {}
