import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';
import { FoldersService } from 'modules/folders/services/folders.service';
import { FoldersController } from 'modules/folders/controllers/folders.controller';
import { FoldersResponseFactory } from 'modules/folders/factories/folders-response.factory';
import { FolderContentsResponseFactory } from 'modules/folders/factories/folder-contents-response.factory';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { CompetitorRepository } from 'modules/competitors/repositories/competitor.repository';
import { NoteRepository } from 'modules/notes/repositories/note.repository';
import { ProjectTagRepository } from 'modules/tags/repositories/project-tag.repository';
import { CacheModule } from 'modules/cache/cache.module';
import { FoldersSaga } from 'modules/folders/sagas/folders.saga';
import { DeleteFoldersCommandHandler } from 'modules/folders/command-handlers/delete-folders.command-handler';
import { CqrsModule } from '@nestjs/cqrs';
import { MyFoldersResponseFactory } from 'modules/folders/factories/my-folders-response.factory';
import { LoggingModule } from 'modules/logging/logging.module';
const commandHandlers = [DeleteFoldersCommandHandler];
/**
 * The FoldersModule is responsible for managing the folder-related functionality. It is a part of the application's module system.
 *
 * This module imports several other modules and repositories including:
 * - TypeOrmModule with folder and keyword related repositories.
 * - CacheModule for caching functionalities.
 * - CqrsModule to support CQRS pattern.
 * - LoggingModule for logging purposes.
 *
 * The module providers offer several services and response factories to handle folder-related operations. Specifically:
 * - `FoldersService`: A service to handle business logic related to folders.
 * - `FoldersResponseFactory`: A factory to generate responses for folder operations.
 * - `FolderContentsResponseFactory`: A factory to create responses for folder contents.
 * - `FoldersSaga`: Coordinates synchronous and asynchronous responses.
 * - `commandHandlers`: An array of command handlers for folder commands.
 * - `MyFoldersResponseFactory`: A factory to generate responses for operations on personal folders.
 *
 * The module also includes a controller:
 * - `FoldersController`: A controller to manage HTTP requests related to folders.
 *
 * Finally, the module exports:
 * - `FoldersService` for external usage.
 * - `TypeOrmModule` with `FolderRepository`.
 * - `FoldersResponseFactory` for generating folder responses.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FolderRepository,
      KeywordRepository,
      CompetitorKeywordPositionRepository,
      CompetitorRepository,
      NoteRepository,
      ProjectTagRepository,
    ]),
    CacheModule,
    CqrsModule,
    LoggingModule,
  ],
  providers: [
    FoldersService,
    FoldersResponseFactory,
    FolderContentsResponseFactory,
    FoldersSaga,
    ...commandHandlers,
    MyFoldersResponseFactory,
  ],
  controllers: [FoldersController],
  exports: [
    FoldersService,
    TypeOrmModule.forFeature([FolderRepository]),
    FoldersResponseFactory,
  ],
})
export class FoldersModule {}
