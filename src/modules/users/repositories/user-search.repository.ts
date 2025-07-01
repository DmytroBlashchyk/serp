import { EntityRepository } from 'typeorm';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { UserSearchEntity } from 'modules/users/entities/user-search.entity';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { SearchResultsType } from 'modules/users/types/search-results.type';

@Injectable()
@EntityRepository(UserSearchEntity)
export class UserSearchRepository extends BaseRepository<UserSearchEntity> {
  /**
   * Retrieves the search results for a given user.
   *
   * @param {IdType} userId - The unique identifier of the user.
   * @return {Promise<SearchResultsType[]>} A promise that resolves to an array of search results.
   */
  async getSearchResults(userId: IdType): Promise<SearchResultsType[]> {
    return this.query(
      `
SELECT 
    user_searches.project_id as project_id,
    projects.project_name as project_name,
    projects.url as url
from user_searches
left join projects on user_searches.project_id = projects.id
inner join (
    select
        max(user_searches.created_at) as created_at,
        project_id
    from user_searches where user_id = $1 group by project_id) as result
    on user_searches.project_id = result.project_id and user_searches.created_at = result.created_at
order by user_searches.created_at DESC 
limit 5`,
      [userId],
    );
  }

  /**
   * Retrieves a list of user search entities associated with the specified user ID.
   *
   * @param {IdType} userId - The identifier of the user whose search entities are to be retrieved.
   * @return {Promise<UserSearchEntity[]>} A promise that resolves to an array of UserSearchEntity objects.
   */
  async getUserSearches(userId: IdType): Promise<UserSearchEntity[]> {
    return this.find({ where: { user: { id: userId } } });
  }
}
