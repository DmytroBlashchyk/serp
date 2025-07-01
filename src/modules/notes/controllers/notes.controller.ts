import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NotesService } from 'modules/notes/services/notes.service';
import { IdType } from 'modules/common/types/id-type.type';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { GetProjectNotesRequest } from 'modules/notes/requests/get-project-notes.request';
import { GetNotesResponse } from 'modules/notes/responses/get-notes.response';
import { CreateNoteRequest } from 'modules/notes/requests/create-note.request';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { BulkDeleteRequest } from 'modules/notes/requests/bulk-delete.request';

@ApiTags('Notes')
@Controller('accounts')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /**
   * Fetches a note based on the provided note ID, project ID, and account ID.
   *
   * @param {number} id - The account ID.
   * @param {number} projectId - The project ID.
   * @param {number} noteId - The note ID.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<NoteResponse>} - A promise that resolves to a NoteResponse object.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: NoteResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/notes/:noteId')
  getNote(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Param('noteId', new ParseIntPipe()) noteId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<NoteResponse> {
    return this.notesService.getNote({
      accountId: id,
      noteId,
      projectId,
      userId: tokenData.user.id,
    });
  }

  /**
   * Retrieves the notes associated with the specified project ID.
   *
   * @param {number} id - The unique identifier of the project.
   * @param {SerpnestUserTokenData} tokenData - The authentication token data of the user.
   * @param {GetProjectNotesRequest} query - The request query parameters for retrieving project notes.
   * @return {Promise<GetNotesResponse>} The promise resolving to the response containing project notes.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: GetNotesResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get('/:id/notes')
  getNotes(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: GetProjectNotesRequest,
  ): Promise<GetNotesResponse> {
    return this.notesService.getAllNotes(id, tokenData.user, query);
  }

  /**
   * Retrieves notes for a specific project associated with a given account ID.
   *
   * @param {IdType} id - The identifier for the account.
   * @param {IdType} projectId - The identifier for the project.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @param {GetProjectNotesRequest} query - Query parameters for filtering and pagination.
   * @return {Promise<GetNotesResponse>} A promise that resolves to the notes response containing project notes data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: GetNotesResponse })
  @Get('/:id/projects/:projectId/notes')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  getProjectNotes(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: GetProjectNotesRequest,
  ): Promise<GetNotesResponse> {
    return this.notesService.getNotes(
      {
        accountId: id,
        projectId,
        user: tokenData.user,
      },
      { ...query },
    );
  }

  /**
   * Creates a note associated with a specific project.
   *
   * @param {IdType} id - The identifier of the account.
   * @param {IdType} projectId - The identifier of the project.
   * @param {SerpnestUserTokenData} tokenData - The user token data.
   * @param {CreateNoteRequest} body - The request body containing the note data.
   * @return {Promise<void>} Promise that resolves when the note has been created.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Post(':id/projects/:projectId/create-note')
  createNoteToProjects(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: CreateNoteRequest,
  ): Promise<void> {
    return this.notesService.createNote({
      accountId: id,
      user: tokenData.user,
      text: body.text,
      projectId,
    });
  }

  /**
   * Updates a specific note within a project.
   *
   * @param {IdType} id - The identifier of the account.
   * @param {IdType} projectId - The identifier of the project.
   * @param {IdType} noteId - The identifier of the note to edit.
   * @param {SerpnestUserTokenData} tokenData - The user token data containing authentication information.
   * @param {CreateNoteRequest} body - The request body containing the new text for the note.
   * @return {Promise<void>} A promise that resolves when the note has been successfully edited.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @ApiForbiddenResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Patch(':id/projects/:projectId/notes/:noteId')
  editNote(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Param('noteId', new ParseIntPipe()) noteId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: CreateNoteRequest,
  ): Promise<void> {
    return this.notesService.editProjectNote({
      accountId: id,
      noteId,
      projectId,
      user: tokenData.user,
      text: body.text,
    });
  }

  /**
   * Deletes a specific note from a project.
   *
   * @param {number} id - The account ID.
   * @param {number} projectId - The project ID from which the note will be deleted.
   * @param {number} noteId - The ID of the note to be deleted.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<void>} A promise that resolves when the note is successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @ApiForbiddenResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Delete(':id/projects/:projectId/notes/:noteId')
  async deleteNote(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Param('noteId', new ParseIntPipe()) noteId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.notesService.deleteProjectNote({
      accountId: id,
      projectId,
      user: tokenData.user,
      noteId,
    });
  }

  /**
   * Endpoint to perform bulk delete of notes for a specific account.
   *
   * @param {number} id - The ID of the account whose notes are to be deleted.
   * @param {object} tokenData - The token data of the authenticated user.
   * @param {object} body - The request body containing note IDs to be deleted.
   * @return {Promise<void>} - A promise that resolves when the deletion is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post(':id/notes/bulk-delete')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  async bulkDelete(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: BulkDeleteRequest,
  ): Promise<void> {
    return this.notesService.bulkDelete({
      accountId: id,
      user: tokenData.user,
      noteIds: body.noteIds,
    });
  }
}
