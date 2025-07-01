import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { DeviceTypesService } from 'modules/device-types/services/device-types.service';
import { DeviceTypesController } from 'modules/device-types/controllers/device-types.controller';

/**
 * The DeviceTypesModule integrates the Device Types functionality into the application.
 *
 * This module imports the necessary TypeOrmModule for accessing the DeviceTypesRepository,
 * provides the DeviceTypesService for handling business logic, and includes the
 * DeviceTypesController for managing HTTP requests related to device types.
 *
 * Additionally, the module exports the DeviceTypesService and the configured TypeOrmModule
 * for use in other parts of the application.
 *
 * Decorators used:
 *
 * - `@Module`: Indicates that this class is a NestJS module that combines several components
 *    to create a feature module.
 *
 * Components included:
 *
 * - imports: Registers the TypeOrmModule with the DeviceTypesRepository.
 *
 * - providers: Supplies the DeviceTypesService which contains the business logic for device types.
 *
 * - controllers: Defines the DeviceTypesController to manage incoming HTTP requests.
 *
 * - exports: Makes the DeviceTypesService and TypeOrmModule available for other modules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([DeviceTypesRepository])],
  providers: [DeviceTypesService],
  controllers: [DeviceTypesController],
  exports: [
    DeviceTypesService,
    TypeOrmModule.forFeature([DeviceTypesRepository]),
  ],
})
export class DeviceTypesModule {}
