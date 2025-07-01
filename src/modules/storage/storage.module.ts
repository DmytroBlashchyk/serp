import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageItemRepository } from 'modules/storage/repositories/storage-item.repository';
import { StorageService } from 'modules/storage/services/storage.service';
import { CommonModule } from 'modules/common/common.module';

/**
 * This module handles the storage functionality and configurations. It imports the necessary
 * elements required for database interaction through TypeORM and the common functionalities.
 *
 * The module encompasses:
 * - Importing StorageItemRepository using TypeOrmModule for database operations.
 * - CommonModule to leverage shared functionalities across the application.
 *
 * It provides the StorageService which contains the core business logic for storage-related
 * tasks and ensures this service is available for other modules by exporting it.
 */
@Module({
  imports: [TypeOrmModule.forFeature([StorageItemRepository]), CommonModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
