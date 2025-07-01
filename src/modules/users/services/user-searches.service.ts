import { Injectable, NotFoundException } from '@nestjs/common';
import { SaveUserSearchType } from 'modules/users/types/save-user-search.type';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { UserSearchRepository } from 'modules/users/repositories/user-search.repository';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { SearchResultsType } from 'modules/users/types/search-results.type';

@Injectable()
export class UserSearchesService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userSearchRepository: UserSearchRepository,
    private readonly projectRepository: ProjectRepository,
  ) {}

  /**
   * Retrieves the latest custom search results for a given user.
   *
   * @param {IdType} userId - The identifier of the user whose search results are to be fetched.
   * @return {Promise<SearchResultsType[]>} A promise that resolves to an array of search results.
   */
  async getLatestCustomSearchResults(
    userId: IdType,
  ): Promise<SearchResultsType[]> {
    return await this.userSearchRepository.getSearchResults(userId);
  }

  /**
   * Clears the recently viewed results of a user by removing their search history.
   *
   * @param {IdType} userId - The ID of the user whose recently viewed results are to be cleared.
   * @return {Promise<void>} A promise that resolves when the user's recently viewed results have been cleared.
   */
  async clearUserRecentlyViewedResults(userId: IdType): Promise<void> {
    const userSearches = await this.userSearchRepository.getUserSearches(
      userId,
    );
    if (userSearches.length) {
      await this.userSearchRepository.remove(userSearches);
    }
  }

  /**
   * Saves a user's search data in the repository.
   *
   * @param {SaveUserSearchType} payload - The search data payload that includes user and project identifiers.
   * @return {Promise<void>} A promise that resolves when the user's search is successfully saved.
   * @throws {NotFoundException} If the user or project is not found.
   */
  async saveUserSearch(payload: SaveUserSearchType): Promise<void> {
    const user = await this.userRepository.getUserById(payload.userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const project = await this.projectRepository.getProjectById(
      payload.projectId,
    );
    if (!project) {
      throw new NotFoundException('Project not found.');
    }
    await this.userSearchRepository.save({
      user,
      project,
    });
  }
}
