import { Module } from '@nestjs/common';
import { CheckFrequencyService } from 'modules/check-frequency/services/check-frequency.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckFrequencyRepository } from 'modules/check-frequency/repositories/check-frequency.repository';
import { CheckFrequencyController } from 'modules/check-frequency/controllers/check-frequency.controller';

/**
 * The CheckFrequencyModule class sets up the module configuration for the CheckFrequency feature.
 * This includes importing the necessary repository, providing the service,
 * and defining the controller and exports.
 *
 * Imports:
 * - TypeOrmModule.forFeature([CheckFrequencyRepository]): Imports the CheckFrequencyRepository to interact with the database.
 *
 * Providers:
 * - CheckFrequencyService: The service responsible for the business logic related to check frequency.
 *
 * Controllers:
 * - CheckFrequencyController: The controller that handles HTTP requests for the check frequency feature.
 *
 * Exports:
 * - CheckFrequencyService: Exports the CheckFrequencyService to be used in other modules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([CheckFrequencyRepository])],
  providers: [CheckFrequencyService],
  controllers: [CheckFrequencyController],
  exports: [CheckFrequencyService],
})
export class CheckFrequencyModule {}
