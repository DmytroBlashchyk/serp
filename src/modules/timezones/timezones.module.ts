import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimezoneRepository } from 'modules/timezones/repositories/timezone.repository';
import { TimezonesService } from 'modules/timezones/services/timezones.service';
import { TimezonesController } from 'modules/timezones/controllers/timezones.controller';
import { TimezonesResponseFactory } from 'modules/timezones/factories/timezones-response.factory';

/**
 * The TimezonesModule class sets up the dependencies and services required for managing timezones.
 *
 * This module imports the TypeOrmModule with the TimezoneRepository for database interactions related to timezones.
 * It provides the TimezonesService and TimezonesResponseFactory as providers to manage the business logic and response formatting.
 * The TimezonesController is used to handle incoming HTTP requests and route them to appropriate services.
 * Finally, it exports the TimezonesService to be used in other parts of the application.
 */
@Module({
  imports: [TypeOrmModule.forFeature([TimezoneRepository])],
  providers: [TimezonesService, TimezonesResponseFactory],
  controllers: [TimezonesController],
  exports: [TimezonesService],
})
export class TimezonesModule {}
