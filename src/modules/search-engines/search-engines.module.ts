import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchEngineRepository } from 'modules/search-engines/repositories/search-engine.repository';
import { SearchEnginesService } from 'modules/search-engines/services/search-engines.service';
import { SearchEnginesController } from 'modules/search-engines/controllers/search-engines.controller';

/**
 * The SearchEnginesModule class is a module definition for managing search engines within the application.
 *
 * This module imports necessary features from the TypeOrmModule with the SearchEngineRepository.
 * It also provides services through the SearchEnginesService and includes a controller, SearchEnginesController,
 * for handling incoming requests related to search engines.
 *
 * - `imports`: An array containing TypeOrmModule which imports the SearchEngineRepository for database interactions.
 * - `providers`: Array including the SearchEnginesService for defining business logic and operations.
 * - `controllers`: Array with the SearchEnginesController to manage HTTP requests and responses.
 * - `exports`: Array exporting the SearchEnginesService to be used in other modules.
 */
@Module({
  imports: [TypeOrmModule.forFeature([SearchEngineRepository])],
  providers: [SearchEnginesService],
  controllers: [SearchEnginesController],
  exports: [SearchEnginesService],
})
export class SearchEnginesModule {}
