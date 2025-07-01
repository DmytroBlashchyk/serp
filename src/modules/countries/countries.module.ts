import { Module } from '@nestjs/common';
import { CountriesService } from 'modules/countries/services/countries.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRepository } from 'modules/countries/repositories/country.repository';
import { CountriesControllers } from 'modules/countries/controllers/countries.controllers';
import { LocationRepository } from 'modules/countries/repositories/location.repository';
import { LocationsService } from 'modules/countries/services/locations.service';
import { LoggingService } from 'modules/logging/services/logging.service';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queues } from 'modules/queue/enums/queues.enum';
import { redisFactory } from 'modules/common/utils/redisFactory';
import { LoggingModule } from 'modules/logging/logging.module';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { LocationsJobEmitter } from 'modules/countries/job-emmiters/locations.job-emitter';

/**
 * CountriesModule is responsible for managing the countries and their related data within the application.
 *
 * This module imports the necessary repositories to interact with the database.
 * It also provides essential services for handling country and location logic.
 *
 * Controllers:
 * - CountriesControllers: Handles HTTP requests related to countries.
 *
 * Imports:
 * - TypeOrmModule: Provides database interaction capabilities for CountryRepository and LocationRepository.
 *
 * Providers:
 * - CountriesService: Contains business logic related to countries.
 * - LocationsService: Manages location-related operations.
 * - LoggingService: Provides logging functionalities.
 *
 * Exports:
 * - CountriesService: Allows other modules to use country-related services.
 * - LocationsService: Makes location-related services available for other modules.
 */
@Module({
  controllers: [CountriesControllers],
  imports: [
    TypeOrmModule.forFeature([CountryRepository, LocationRepository]),
    LoggingModule,
    BullModule.registerQueueAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: Queues.Locations,
      useFactory: async (config: ConfigService) => ({
        processors: [],
        redis: redisFactory(config),
      }),
    }),
  ],
  providers: [
    CountriesService,
    LocationsService,
    DataForSeoService,
    LocationsJobEmitter,
  ],
  exports: [
    CountriesService,
    LocationsService,
    LocationsJobEmitter,
    TypeOrmModule.forFeature([LocationRepository]),
  ],
})
export class CountriesModule {}
