import { Module } from '@nestjs/common';
import { SharedLinksController } from 'modules/shared-links/controllers/shared-links.controller';
import { SharedLinksService } from 'modules/shared-links/services/shared-links.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedLinkSettingRepository } from 'modules/shared-links/repositories/shared-link-setting.repository';
import { SharedLinkRepository } from 'modules/shared-links/repositories/shared-link.repository';
import { ProjectsModule } from 'modules/projects/projects.module';
import { CommonModule } from 'modules/common/common.module';
import { FoldersModule } from 'modules/folders/folders.module';
import { SharedLinkTypeRepository } from 'modules/shared-links/repositories/shared-link-type.repository';
import { SharedController } from 'modules/shared-links/controllers/shared.controller';
import { ProjectsBySharedLinkResponseFactory } from 'modules/shared-links/factories/projects-by-shared-link-response.factory';
import { DeviceTypesModule } from 'modules/device-types/device-types.module';
import { SharedLinksResponseFactory } from 'modules/shared-links/factories/shared-links-response.factory';
import { KeywordsModule } from 'modules/keywords/keywords.module';
import { CompetitorsModule } from 'modules/competitors/competitors.module';
import { SharedLinkInfoResponseFactory } from 'modules/shared-links/factories/shared-linkInfo-response.factory';
import { StorageModule } from 'modules/storage/storage.module';
import { CacheModule } from 'modules/cache/cache.module';
import { GatewayModule } from 'modules/gateway/gateway.module';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { TagsModule } from 'modules/tags/tags.module';
import { NotesModule } from 'modules/notes/notes.module';
import { SharedLinksSaga } from 'modules/shared-links/sagas/shared-links.saga';
import { DeletingEmptySharedLinksCommandHandler } from 'modules/shared-links/command-handlers/deleting-empty-shared-links.command-handler';
import { LoggingModule } from 'modules/logging/logging.module';
import { GetKeywordResponseFactory } from 'modules/keywords/factories/get-keyword-response.factory';

/**
 * Array of command handler objects used to process specific commands within the application.
 * Each handler is responsible for a particular type of command, encapsulating the logic needed to process and execute it.
 *
 * @type {Array<Object>}
 */
const commandHandlers = [DeletingEmptySharedLinksCommandHandler];

/**
 * The SharedLinksModule class is responsible for handling shared links
 * within the application. It imports various other modules and repositories
 * essential for its functionality and provides a set of services, factories,
 * and controllers to manage shared link operations.
 *
 * @module SharedLinksModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SharedLinkSettingRepository,
      SharedLinkRepository,
      SharedLinkTypeRepository,
    ]),
    CommonModule,
    ProjectsModule,
    FoldersModule,
    DeviceTypesModule,
    KeywordsModule,
    CompetitorsModule,
    StorageModule,
    CacheModule,
    GatewayModule,
    AccountLimitsModule,
    TagsModule,
    NotesModule,
    LoggingModule,
  ],
  providers: [
    SharedLinksService,
    ProjectsBySharedLinkResponseFactory,
    SharedLinksResponseFactory,
    SharedLinkInfoResponseFactory,
    SharedLinksSaga,
    ...commandHandlers,
    GetKeywordResponseFactory,
  ],
  controllers: [SharedLinksController, SharedController],
  exports: [],
})
export class SharedLinksModule {}
