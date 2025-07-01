import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { NoteEntity } from 'modules/notes/entities/note.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { GetProjectNotesRequest } from 'modules/notes/requests/get-project-notes.request';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortNotesEnum } from 'modules/notes/enums/sort-notes.enum';

@Injectable()
@EntityRepository(NoteEntity)
export class NoteRepository extends BaseRepository<NoteEntity> {
  /**
   * Retrieves notes for a given account and list of note IDs.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType[]} noteIds - An array of note IDs to be retrieved.
   * @return {Promise<NoteEntity[]>} - A promise that resolves to an array of NoteEntity objects.
   */
  async getNotes(accountId: IdType, noteIds: IdType[]): Promise<NoteEntity[]> {
    return this.createQueryBuilder('notes')
      .withDeleted()
      .leftJoinAndSelect('notes.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('notes.author', 'author')
      .where('account.id =:accountId and notes.id in(:...noteIds)', {
        accountId,
        noteIds,
      })
      .getMany();
  }
  /**
   * Retrieves all notes associated with a given project, including those that have been deleted.
   * Joins related entities such as project, account, account owner, and note author.
   *
   * @param {IdType} projectId - The unique identifier of the project for which notes are to be retrieved.
   * @return {Promise<NoteEntity[]>} A promise resolved with an array of NoteEntity objects related to the specified project.
   */
  async getProjectNotes(projectId: IdType): Promise<NoteEntity[]> {
    return this.createQueryBuilder('notes')
      .withDeleted()
      .leftJoinAndSelect('notes.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('notes.author', 'author')
      .where('project.id =:projectId', { projectId })
      .getMany();
  }

  /**
   * Fetches a specific project note based on the provided account, project, and note IDs.
   *
   * @param {IdType} accountId - The ID of the account associated with the project.
   * @param {IdType} projectId - The ID of the project that the note belongs to.
   * @param {IdType} noteId - The ID of the note to retrieve.
   * @return {Promise<NoteEntity>} A promise that resolves to the note entity.
   */
  async getProjectNote(
    accountId: IdType,
    projectId: IdType,
    noteId: IdType,
  ): Promise<NoteEntity> {
    return this.createQueryBuilder('notes')
      .withDeleted()
      .leftJoinAndSelect('notes.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('notes.author', 'author')
      .where(
        'notes.id =:noteId and account.id =:accountId and project.id =:projectId',
        {
          noteId,
          accountId,
          projectId,
        },
      )
      .getOne();
  }

  /**
   * Retrieves notes for a given project within a specified date range.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {string} fromDate - The start date of the range in 'YYYY-MM-DD' format.
   * @param {string} toDate - The end date of the range in 'YYYY-MM-DD' format.
   * @return {Promise<NoteEntity[]>} A promise that resolves to an array of NoteEntity objects.
   */
  async getNotesByDates(
    projectId: IdType,
    fromDate: string,
    toDate: string,
  ): Promise<NoteEntity[]> {
    return this.createQueryBuilder('notes')
      .leftJoinAndSelect('notes.project', 'project')
      .leftJoinAndSelect('notes.author', 'author')
      .where(
        `project.id =:projectId and notes.createdAt >=:fromDate and notes.createdAt <=:toDate`,
        {
          projectId,
          fromDate,
          toDate,
        },
      )
      .orderBy('notes.createdAt', 'ASC')
      .getMany();
  }

  /**
   * Retrieves paginated notes for a given account and user.
   *
   * @param {IdType} accountId - The ID of the account to filter notes by.
   * @param {IdType} userId - The ID of the user to filter notes by.
   * @param {GetProjectNotesRequest} options - Options for pagination, sorting, and search.
   * @return {Promise<Pagination<NoteEntity>>} A promise that resolves to the paginated notes.
   */
  async paginatedNotes(
    accountId: IdType,
    userId: IdType,
    options: GetProjectNotesRequest,
  ): Promise<Pagination<NoteEntity>> {
    const searchQuery = options.search ? ` and notes.text ILike(:search)` : ``;
    const queryBuilder = this.createQueryBuilder('notes')
      .leftJoinAndSelect('notes.project', 'project')
      .leftJoinAndSelect('project.users', 'users')
      .leftJoinAndSelect('notes.author', 'author')
      .where(
        `project.account_id =:accountId and users.id =:userId ${searchQuery}`,
        {
          accountId,
          userId,
          search: `%${options.search}%`,
        },
      );
    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortNotesEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('notes.createdAt', options.sortOrder);
    }
    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }

  /**
   * Retrieves a paginated list of notes for a specific project.
   *
   * @param {IdType} accountId - The ID of the account to which the project belongs.
   * @param {IdType} projectId - The ID of the project for which notes are to be retrieved.
   * @param {GetProjectNotesRequest} options - Additional options for querying, sorting, and paginating the notes.
   * @return {Promise<Pagination<NoteEntity>>} A promise that resolves to a paginated list of note entities.
   */
  async paginatedProjectNotes(
    accountId: IdType,
    projectId: IdType,
    options: GetProjectNotesRequest,
  ): Promise<Pagination<NoteEntity>> {
    const searchQuery = options.search ? ` and notes.text ILike(:search)` : ``;
    const queryBuilder = this.createQueryBuilder('notes')
      .leftJoinAndSelect('notes.project', 'project')
      .leftJoinAndSelect('notes.author', 'author')
      .where(
        `project.id =:projectId and project.account_id =:accountId ${searchQuery}`,
        {
          accountId,
          projectId,
          search: `%${options.search}%`,
        },
      );
    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortNotesEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('notes.createdAt', options.sortOrder);
    }
    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }
}
