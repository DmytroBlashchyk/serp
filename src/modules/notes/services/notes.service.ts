import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NoteRepository } from 'modules/notes/repositories/note.repository';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { GetNotesType } from 'modules/notes/types/get-notes.type';
import { GetProjectNotesRequest } from 'modules/notes/requests/get-project-notes.request';
import { GetNotesResponse } from 'modules/notes/responses/get-notes.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { CreateNoteType } from 'modules/notes/types/create-note.type';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { EditProjectNoteType } from 'modules/notes/types/edit-project-note.type';
import { DeleteProjectNoteType } from 'modules/notes/types/delete-project-note.type';
import { NoteType } from 'modules/notes/types/note.type';
import { GetNotesProjectByDateType } from 'modules/notes/types/get-notes-project-by-date.type';
import { BulkDeleteType } from 'modules/notes/types/bulk-delete.type';
import { IdType } from 'modules/common/types/id-type.type';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { GetNotesResponseFactory } from 'modules/notes/factories/get-notes.response.factory';
import { RoleEnum } from 'modules/auth/enums/role.enum';

@Injectable()
export class NotesService {
  constructor(
    private readonly noteRepository: NoteRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly getNotesResponseFactory: GetNotesResponseFactory,
  ) {}

  /**
   * Fetches the notes associated with a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project whose notes are being fetched.
   * @return {Promise<NoteEntity[]>} A promise that resolves to an array of NoteEntity objects associated with the project.
   */
  async getProjectNotes(projectId: IdType): Promise<NoteEntity[]> {
    return this.noteRepository.getProjectNotes(projectId);
  }

  /**
   * Retrieves the notes for a specific project within a given date range.
   *
   * @param {GetNotesProjectByDateType} payload - The data for retrieving the notes, which includes the projectId,
   *                                                fromDate, and toDate.
   * @return {Promise<NoteEntity[]>} A promise that resolves to an array of NoteEntity objects representing the notes
   *                                 that fall within the specified date range for the given project.
   */
  async getNotesProjectByDate(
    payload: GetNotesProjectByDateType,
  ): Promise<NoteEntity[]> {
    return this.noteRepository.getNotesByDates(
      payload.projectId,
      payload.fromDate,
      payload.toDate,
    );
  }

  /**
   * Retrieves a note associated with a specific project and user within an account.
   * If the user does not have access to the project, an exception is thrown.
   *
   * @param {NoteType} payload - The payload containing accountId, projectId, userId, and noteId.
   * @return {Promise<NoteResponse>} A promise that resolves to a NoteResponse object containing the details of the note.
   * @throws {ForbiddenException} If the user does not have access to the specified project.
   */
  async getNote(payload: NoteType): Promise<NoteResponse> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        payload.accountId,
        [payload.projectId],
        payload.userId,
      );
    if (projects.length !== 1) {
      throw new ForbiddenException('Access denied.');
    }
    const note = await this.noteRepository.getProjectNote(
      payload.accountId,
      payload.projectId,
      payload.noteId,
    );
    return new NoteResponse({
      ...note,
      date: dateHelper(note.createdAt),
      dateFullFormat: formatGoogleStyleDate(note.createdAt),
      author: note?.author?.email,
    });
  }

  /**
   * Deletes a bulk of notes for a given account and user after validating permissions.
   *
   * @param {BulkDeleteType} payload - The payload containing account ID, note IDs, and user information.
   * @return {Promise<void>} - Resolves when the notes are successfully deleted.
   * @throws {ForbiddenException} - Throws if the user does not have permission to delete the notes.
   */
  @Transactional()
  async bulkDelete(payload: BulkDeleteType): Promise<void> {
    const notes = await this.noteRepository.getNotes(
      payload.accountId,
      payload.noteIds,
    );

    const projectIds = [...new Set(notes.map((note) => note.project.id))];
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        payload.accountId,
        projectIds,
        payload.user.id,
      );
    if (projects.length !== projectIds.length) {
      throw new ForbiddenException('Access denied.');
    }

    if (
      payload.user.accounts.find((account) => account.id == payload.accountId)
        ?.role?.name === RoleEnum.Admin
    ) {
      await this.noteRepository.remove(notes);
      await this.accountLimitsService.accountingNotes(
        payload.accountId,
        notes.length * -1,
      );
    } else {
      for (const note of notes) {
        if (note.author?.id !== payload.user.id) {
          throw new ForbiddenException('No permission to remove the note.');
        }
      }
      await this.noteRepository.remove(notes);
      await this.accountLimitsService.accountingNotes(
        payload.accountId,
        notes.length * -1,
      );
    }
  }

  /**
   * Deletes a project note.
   *
   * @param {DeleteProjectNoteType} payload - The payload containing details necessary to delete the note.
   * @param {string} payload.accountId - The ID of the account related to the note.
   * @param {string} payload.projectId - The ID of the project related to the note.
   * @param {string} payload.noteId - The ID of the note to be deleted.
   * @param {UserType} payload.user - The user attempting to delete the note.
   * @return {Promise<void>} A promise that resolves when the note has been deleted.
   * @throws {ForbiddenException} If the user does not have permission to delete the note.
   */
  async deleteProjectNote(payload: DeleteProjectNoteType): Promise<void> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        payload.accountId,
        [payload.projectId],
        payload.user.id,
      );
    if (projects.length !== 1) {
      throw new ForbiddenException('Access denied.');
    }

    const note = await this.noteRepository.getProjectNote(
      payload.accountId,
      payload.projectId,
      payload.noteId,
    );
    if (
      payload.user.accounts.find((account) => account.id == payload.accountId)
        ?.role?.name === RoleEnum.Admin
    ) {
      await this.noteRepository.remove(note);
      await this.accountLimitsService.accountingNotes(payload.accountId, -1);
    } else {
      if (note.author?.id !== payload.user.id) {
        throw new ForbiddenException('No permission to remove the note.');
      }
      await this.noteRepository.remove(note);
      await this.accountLimitsService.accountingNotes(payload.accountId, -1);
    }
  }

  /**
   * Edits the text content of a project note.
   *
   * @param {EditProjectNoteType} payload - The data required to edit the project note.
   * @param {number} payload.accountId - The ID of the account associated with the project.
   * @param {number} payload.projectId - The ID of the project containing the note.
   * @param {number} payload.noteId - The ID of the note to be edited.
   * @param {string} payload.text - The new text content for the note.
   * @param {object} payload.user - The user attempting to edit the note.
   * @param {object[]} payload.user.accounts - The accounts associated with the user.
   * @param {number} payload.user.id - The ID of the user.
   *
   * @return {Promise<void>} - A promise that resolves when the note has been successfully edited.
   *
   * @throws {ForbiddenException} - If the user does not have permission to edit the note.
   */
  async editProjectNote(payload: EditProjectNoteType): Promise<void> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        payload.accountId,
        [payload.projectId],
        payload.user.id,
      );
    if (projects.length !== 1) {
      throw new ForbiddenException('Access denied.');
    }
    const note = await this.noteRepository.getProjectNote(
      payload.accountId,
      payload.projectId,
      payload.noteId,
    );
    if (
      payload.user.accounts.find((account) => account.id === payload.user.id)
        ?.role?.name === RoleEnum.Admin
    ) {
      await this.noteRepository.save({ ...note, text: payload.text });
    } else {
      if (note.author?.id !== payload.user.id) {
        throw new ForbiddenException('No permission to edit the note.');
      }
      await this.noteRepository.save({ ...note, text: payload.text });
    }
  }

  /**
   * Creates a new note for a specific project.
   *
   * @param {CreateNoteType} payload - The payload containing necessary data to create a note.
   * @param {number} payload.accountId - The ID of the account.
   * @param {number} payload.projectId - The ID of the project.
   * @param {string} payload.text - The text content of the note.
   * @param {Object} payload.user - The user object containing user details.
   * @param {number} payload.user.id - The ID of the user.
   *
   * @returns {Promise<void>} A promise that resolves when the note has been successfully created.
   *
   * @throws {ForbiddenException} If the user does not have access to the specified project.
   * @throws {NotFoundException} If the specified project is not found.
   */
  @Transactional()
  async createNote(payload: CreateNoteType): Promise<void> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        payload.accountId,
        [payload.projectId],
        payload.user.id,
      );
    if (projects.length !== 1) {
      throw new ForbiddenException('Access denied.');
    }
    const project = await this.projectRepository.getProjectById(
      payload.projectId,
    );
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    await this.createNotes(payload.text, project, payload.user);
  }

  /**
   * Retrieves all notes associated with a specific account and user, with optional pagination and filtering.
   *
   * @param {IdType} accountId - The ID of the account to get notes for.
   * @param {UserPayload} user - The payload containing user information.
   * @param {GetProjectNotesRequest} options - The pagination and filtering options for retrieving notes.
   * @return {Promise<GetNotesResponse>} A promise that resolves to the response containing the notes and metadata.
   */
  async getAllNotes(
    accountId: IdType,
    user: UserPayload,
    options: GetProjectNotesRequest,
  ): Promise<GetNotesResponse> {
    const { items, meta } = await this.noteRepository.paginatedNotes(
      accountId,
      user.id,
      options,
    );

    return this.getNotesResponseFactory.createResponse(items, {
      meta,
      user,
      accountId,
    });
  }

  /**
   * Retrieves notes associated with a specific project and account, ensuring the user has access to the project.
   *
   * @param {GetNotesType} payload - Contains the necessary information such as account ID, project ID, and user details.
   * @param {GetProjectNotesRequest} options - Options for paginating the project notes.
   * @return {Promise<GetNotesResponse>} - A promise that resolves to the notes response, including items and metadata.
   * @throws {ForbiddenException} - Throws an exception if the user does not have access to the project.
   */
  async getNotes(
    payload: GetNotesType,
    options: GetProjectNotesRequest,
  ): Promise<GetNotesResponse> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        payload.accountId,
        [payload.projectId],
        payload.user.id,
      );
    if (projects.length !== 1) {
      throw new ForbiddenException('Access denied.');
    }
    const { items, meta } = await this.noteRepository.paginatedProjectNotes(
      payload.accountId,
      payload.projectId,
      options,
    );
    return new GetNotesResponse({
      items: items.map((item) => {
        return new NoteResponse({
          ...item,
          date: dateHelper(item.createdAt),
          dateFullFormat: formatGoogleStyleDate(item.createdAt),
          author: item?.author?.email,
          editOption:
            item.author.id === payload.user.id ||
            payload.user.accounts.find(
              (account) => account.id == payload.accountId,
            )?.role?.name === RoleEnum.Admin,
        });
      }),
      meta,
    });
  }

  /**
   * Creates a new note and associates it with a specified project and user.
   *
   * @param {string} note - The content of the note to be created.
   * @param {ProjectEntity} project - The project entity to which the note will be linked.
   * @param {UserPayload} user - The user who authored the note.
   * @return {Promise<void>} A promise that resolves when the note has been successfully saved.
   */
  async createNotes(
    note: string,
    project: ProjectEntity,
    user: UserPayload,
  ): Promise<void> {
    await this.noteRepository.save({
      text: note,
      project: { id: project.id },
      author: { id: user.id },
    });
    await this.accountLimitsService.accountingNotes(project.account.id, 1);
  }
}
