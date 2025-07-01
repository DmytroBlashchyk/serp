import { Module } from '@nestjs/common';
import { NotesController } from 'modules/notes/controllers/notes.controller';
import { NotesService } from 'modules/notes/services/notes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoteRepository } from 'modules/notes/repositories/note.repository';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { AccountLimitsModule } from 'modules/account-limits/account-limits.module';
import { GetNotesResponseFactory } from 'modules/notes/factories/get-notes.response.factory';

/**
 * The `NotesModule` class is a module that encapsulates the notes-related functionalities.
 *
 * This module imports the necessary repositories and other modules required for managing notes.
 * It includes controllers for handling HTTP requests and services for executing business logic.
 * The module also provides the `NotesService`, making it available for other modules to use.
 *
 * Dependencies:
 * - TypeOrmModule: Enables integration with TypeORM and registers `NoteRepository` and `ProjectRepository`.
 * - AccountLimitsModule: Ensures that account-related limits are respected.
 *
 * Controllers:
 * - NotesController: Handles HTTP requests related to notes.
 *
 * Providers:
 * - NotesService: Contains the business logic for managing notes.
 * - GetNotesResponseFactory: Responsible for creating responses for notes requests.
 *
 * Exports:
 * - NotesService: Makes the `NotesService` available for import in other modules.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NoteRepository, ProjectRepository]),
    AccountLimitsModule,
  ],
  controllers: [NotesController],
  providers: [NotesService, GetNotesResponseFactory],
  exports: [NotesService],
})
export class NotesModule {}
