import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { GetPaginatedProjectsAvailableToUserTypeRequest } from 'modules/projects/requests/get-paginated-projects-available-to-user-type.request';
import { ProjectAvailableToUserType } from 'modules/projects/types/project-available-to-user.type';
import { ProjectByLinkType } from 'modules/shared-links/types/project-by-link.type';
import { GetSharedRequest } from 'modules/shared-links/requests/get-shared.request';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortProjectsByLinkEnum } from 'modules/shared-links/enums/sort-projects-by-link.enum';
import { ProjectBySharedLinkType } from 'modules/projects/types/project-by-shared-link.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { ProjectInfoType } from 'modules/projects/types/project-info.type';
import { ApiProjectsRequest } from 'modules/api/requests/api-projects.request';
import { SortProjectsEnum } from 'modules/projects/enums/sort-projects.enum';
import { BrandingInfoType } from 'modules/projects/types/branding-info.type';
import { GetAlertProjectsRequest } from 'modules/alerts/requests/get-alert-projects.request';
import { PayloadProjectInfoType } from 'modules/projects/types/payload-project-info.type';
import { NumberOfEntitiesType } from 'modules/projects/types/number-of-entities.type';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

@Injectable()
@EntityRepository(ProjectEntity)
export class ProjectRepository extends BaseRepository<ProjectEntity> {
  /**
   * Deletes all records associated with the provided project IDs from `users_projects`
   * and `projects_invitations` tables.
   *
   * @param {IdType[]} projectIds - An array of project IDs for which the associated
   *                                records need to be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteAllAssignedProjects(projectIds: IdType[]): Promise<void> {
    await this.query(
      `delete from users_projects where projects_id in (${projectIds.map(
        (id) => id,
      )})`,
    );
    await this.query(
      `delete from projects_invitations where projects_invitations.projects_id in (${projectIds.map(
        (id) => id,
      )})`,
    );
  }

  /**
   * Retrieves all projects associated with the Bing search engine.
   *
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity instances associated with Bing.
   */
  async getAllProjectForBing(): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .leftJoin('projects.searchEngine', 'searchEngine')
      .leftJoin('projects.language', 'language')
      .where(
        'searchEngine.name =:searchEngine and language.keywordDataBing IS TRUE',
        {
          searchEngine: SearchEnginesEnum.Bing,
        },
      )
      .getMany();
  }

  /**
   * Retrieves all projects that are associated with the Google search engine.
   *
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects associated with Google.
   */
  async getAllProjectForGoogle(): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .leftJoin('projects.searchEngine', 'searchEngine')
      .leftJoin('projects.language', 'language')
      .where(
        'searchEngine.name =:searchEngine and language.keywordData IS TRUE',
        {
          searchEngine: SearchEnginesEnum.Google,
        },
      )
      .getMany();
  }

  /**
   * Fetches available projects that are related to a specific account.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType[]} projectIds - An array of project IDs to filter by.
   * @param {IdType} [userId] - Optional user ID to filter projects by user association.
   * @return {Promise<ProjectEntity[]>} - A promise that resolves to an array of ProjectEntity objects.
   */
  async getUserAvailableProjectsInRelationToAccount(
    accountId: IdType,
    projectIds: IdType[],
    userId?: IdType,
  ): Promise<ProjectEntity[]> {
    const queryBuild = this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoin('projects.account', 'account')
      .where('account.id =:accountId', {
        accountId,
      });

    if (projectIds && projectIds.length > 0) {
      queryBuild.andWhere('projects.id in(:...projectIds)', { projectIds });
    }

    if (userId) {
      queryBuild
        .leftJoin('projects.users', 'users')
        .andWhere('users.id =:userId', { userId });
    }

    return queryBuild.getMany();
  }

  /**
   * Updates the project details in the database.
   *
   * @param {IdType} projectId - The unique identifier of the project to be updated.
   * @param {string} name - The new name of the project.
   * @param {string} url - The new URL of the project.
   * @param {IdType} checkFrequencyId - The new check frequency identifier for the project.
   * @return {Promise<void>} A promise that resolves when the project details are successfully updated.
   */
  async updateProject(
    projectId: IdType,
    name: string,
    url: string,
    checkFrequencyId: IdType,
  ): Promise<void> {
    await this.query(
      `
update projects set check_frequency_id = $1, project_name = $2, url = $3 where projects.id = $4

    `,
      [checkFrequencyId, name, url, projectId],
    );
  }

  /**
   * Updates the check frequency for projects with the specified project IDs.
   *
   * @param {IdType[]} projectIds - An array of project IDs for which the check frequency needs to be updated.
   * @param {IdType} checkFrequencyId - The ID of the new check frequency to be set.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async updateCheckFrequency(
    projectIds: IdType[],
    checkFrequencyId: IdType,
  ): Promise<void> {
    await this.query(
      `
update projects set check_frequency_id = $1 where projects.id in (${projectIds.map(
        (id) => id,
      )})
    `,
      [checkFrequencyId],
    );
  }

  /**
   * Retrieves the number of projects associated with a specific account.
   *
   * @param {IdType} accountId - The ID of the account for which to count the projects.
   * @return {Promise<number>} A promise that resolves to the number of projects linked to the given account.
   */
  async getNumberOfAccountProjects(accountId: IdType): Promise<number> {
    return this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoin('projects.account', 'account')
      .where('account.id =:accountId', { accountId })
      .getCount();
  }

  /**
   * Unmounts a specified project from a given folder.
   *
   * @param {IdType} projectId - The unique identifier of the project to be unmounted.
   * @param {IdType} folderId - The unique identifier of the folder from which the project will be unmounted.
   * @return {Promise<void>} - A promise that resolves once the project has been unmounted from the folder.
   */
  async unmountProjectFromFolder(
    projectId: IdType,
    folderId: IdType,
  ): Promise<void> {
    await this.query(
      `DELETE from projects_folders where projects_id = $1 AND folders_id = $2`,
      [projectId, folderId],
    );
  }

  /**
   * Retrieves projects with associated alerts based on the provided account ID and query filters.
   *
   * @param {IdType} accountId - The ID of the account to filter projects by.
   * @param {GetAlertProjectsRequest} query - The query to filter projects and alerts.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to a list of projects.
   */
  async getProjectsWithAlertsByAccountId(
    accountId: IdType,
    query: GetAlertProjectsRequest,
  ): Promise<ProjectEntity[]> {
    const queryBuilder = this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoinAndSelect('projects.account', 'account')
      .innerJoinAndSelect('projects.triggers', 'triggers')
      .innerJoinAndSelect('triggers.type', 'types')
      .innerJoinAndSelect('triggers.alerts', 'alerts')
      .where('account.id =:accountId', { accountId });
    if (query.type) {
      queryBuilder.andWhere('types.name = :type', {
        type: query.type,
      });
    }
    return queryBuilder.orderBy('projects.projectName', 'ASC').getMany();
  }

  /**
   * Retrieves a project associated with a specific account from the database,
   * including various related entities and relation counts.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity
   * including related entities and relation counts.
   */
  async getAccountProjectForAPI(
    accountId: IdType,
    projectId: IdType,
  ): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.location', 'location')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.region', 'region')
      .leftJoinAndSelect('projects.tags', 'tags')
      .leftJoinAndSelect('projects.checkFrequency', 'frequency')
      .leftJoinAndSelect('projects.competitors', 'competitors')
      .leftJoinAndSelect('projects.notes', 'notes')
      .leftJoinAndSelect('notes.author', 'author')
      .leftJoinAndSelect('projects.urlType', 'urlType')
      .loadRelationCountAndMap('projects.keywordsCount', 'projects.keywords')
      .loadRelationCountAndMap('projects.tagsCount', 'projects.tags')
      .loadRelationCountAndMap('projects.notesCount', 'projects.notes')
      .loadRelationCountAndMap(
        'projects.competitorsCount',
        'projects.competitors',
      )
      .where('projects.account_id =:accountId and projects.id =:projectId', {
        accountId,
        projectId,
      })
      .getOne();
  }
  /**
   * Retrieves a paginated list of projects associated with a specific account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {ApiProjectsRequest} options - The pagination and filter options.
   * @return {Promise<PaginatedResult<Project>>} A promise that resolves to the paginated list of projects.
   */
  async paginatedAccountProjects(
    accountId: IdType,
    options: ApiProjectsRequest,
  ) {
    const queryBuilder = this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.region', 'region')
      .leftJoinAndSelect('projects.tags', 'tags')
      .leftJoinAndSelect('projects.checkFrequency', 'frequency')
      .leftJoinAndSelect('projects.competitors', 'competitors')
      .leftJoinAndSelect('projects.notes', 'notes')
      .leftJoinAndSelect('notes.author', 'author')
      .leftJoinAndSelect('projects.urlType', 'urlType')
      .loadRelationCountAndMap('projects.keywordsCount', 'projects.keywords')
      .loadRelationCountAndMap('projects.tagsCount', 'projects.tags')
      .loadRelationCountAndMap('projects.notesCount', 'projects.notes')
      .loadRelationCountAndMap(
        'projects.competitorsCount',
        'projects.competitors',
      )
      .where('projects.account_id =:accountId', { accountId });

    return paginate(queryBuilder, { ...options });
  }

  /**
   * Retrieves the IDs of keywords associated with a specific project.
   *
   * @param {IdType} projectId - The ID of the project whose keyword IDs are to be retrieved.
   * @return {Promise<IdType[]>} A promise that resolves to an array of keyword IDs associated with the project.
   */
  async getKeywordIdsForProject(projectId: IdType): Promise<IdType[]> {
    const project = await this.createQueryBuilder('projects')
      .where('projects.id = :projectId', { projectId })
      .leftJoinAndSelect('projects.keywords', 'keywords')
      .getOne();
    if (project) {
      return project.keywords.map((keyword) => keyword.id);
    } else {
      return [];
    }
  }

  /**
   * Fetches a project along with its keywords, language, and location by its ID.
   *
   * @param {IdType} projectId - The unique ID of the project to be retrieved.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity with associated keywords, language, and location.
   */
  async getProjectByIdWithKeywordsAndLanguageAndLocation(
    projectId: IdType,
  ): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.keywords', 'keywords')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.location', 'location')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .where('projects.id =:projectId', { projectId })
      .getOne();
  }

  /**
   * Retrieves a project by its ID, along with its related entities.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<ProjectEntity>} - A promise that resolves to the project entity with related entities included.
   */
  async getProjectByIdWithRelations(projectId: IdType): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoinAndSelect('projects.account', 'account')
      .leftJoinAndSelect('projects.location', 'location')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .leftJoinAndSelect('projects.region', 'region')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.urlType', 'urlType')
      .leftJoinAndSelect('projects.competitors', 'competitors')
      .where('projects.id =:projectId', { projectId })
      .getOne();
  }

  /**
   * Retrieves a project by its id, including related entities such as account, search engine,
   * language, tags, region, location, and check frequency.
   *
   * @param {IdType} projectId - The id of the project to retrieve.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity, with related entities included.
   */
  async getProjectById(projectId: IdType): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoinAndSelect('projects.account', 'account')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.tags', 'tags')
      .leftJoinAndSelect('projects.region', 'region')
      .leftJoinAndSelect('projects.location', 'location')
      .leftJoinAndSelect('projects.checkFrequency', 'checkFrequency')
      .where('projects.id =:projectId', { projectId })
      .getOne();
  }

  /**
   * Retrieves a project entity grouped by the specified keyword ID, including related entities such as account,
   * keywords, language, region, location, device type, search engine, URL type, and competitors.
   *
   * @param {IdType} keywordId - The unique identifier of the keyword to group the project entities by.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity grouped by the specified keyword ID.
   */
  async getKeywordGroupedByProject(keywordId: IdType): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoinAndSelect('projects.account', 'account')
      .leftJoinAndSelect('projects.keywords', 'keywords')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.region', 'region')
      .leftJoinAndSelect('projects.location', 'location')
      .leftJoinAndSelect('keywords.deviceType', 'deviceType')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .leftJoinAndSelect('projects.urlType', 'urlType')
      .leftJoinAndSelect('projects.competitors', 'competitors')

      .where('keywords.id =:keywordId', { keywordId })
      .getOne();
  }

  /**
   * Retrieves a list of projects, each including associated entities such as account, keywords,
   * language, region, location, and deviceType, filtered by a list of keyword IDs.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to filter projects.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects.
   */
  async getKeywordsGroupedByProject(
    keywordIds: IdType[],
  ): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoinAndSelect('projects.account', 'account')
      .leftJoinAndSelect('projects.keywords', 'keywords')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.region', 'region')
      .leftJoinAndSelect('projects.location', 'location')
      .leftJoinAndSelect('keywords.deviceType', 'deviceType')
      .where('keywords.id in(:...keywordIds)', { keywordIds })
      .getMany();
  }

  /**
   * Retrieves project details matching the provided shared link and project ID.
   *
   * @param {string} link - The shared link of the project.
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {DeviceTypesEnum} [keywordDeviceType] - Optional filter for keyword device type (Desktop, Mobile, or both).
   * @return {Promise<ProjectBySharedLinkType>} A promise that resolves to the project details or null if not found.
   */
  async getProjectByLinkAndProjectId(
    link: string,
    projectId: IdType,
    keywordDeviceType?: DeviceTypesEnum,
  ): Promise<ProjectBySharedLinkType> {
    const result = await this.query(
      `select projects.id as id,
       projects.project_name as project_name,
       projects.business_name as business_name,
       projects.updated_at as updated_at,
       projects.url as url,
       locations.location_name as location,
       google_domains.id as region_id,
       google_domains.name as region_name,
       google_domains.country_name as region_country_name,
       languages.id as language_id,
       languages.name as language_name,
       languages.code as language_code,
       search_engines.id as search_engine_id,
       search_engines.name as search_engine_name,
       keywords_result.desktop_type_count as desktop_type_count,
       keywords_result.keywords_count as keywords_count,
       keywords_result.mobile_type_count as mobile_type_count,
       COUNT(email_reports.id) as email_report_count,
       COUNT(alerts.id) as alert_count,
       TO_CHAR(latest_project_overview.update_date, 'YYYY-MM-DD') as update_date,
       TO_CHAR(latest_project_overview.previous_update_date, 'YYYY-MM-DD') as previous_update_date,
       CASE WHEN keywords_result.desktop_type_count > 0 AND keywords_result.mobile_type_count > 0 
            THEN '${DeviceTypesEnum.DesktopAndMobile}' ELSE
            CASE WHEN keywords_result.mobile_type_count = 0 AND keywords_result.desktop_type_count > 0 
                 THEN '${DeviceTypesEnum.Desktop}' ELSE '${
        DeviceTypesEnum.Mobile
      }' END
            END as keyword_project_type,
       "check-frequency".id as check_frequency_id,
       "check-frequency".name as check_frequency_name,
       count(projects_tags_projects_tags.projects_tags_id)::FLOAT as tag_count,
       keywords_result.number_of_keywords_that_are_updated as number_of_keywords_that_are_updated

from projects
left join projects_tags_projects_tags on projects.id = projects_tags_projects_tags.projects_id
left join "check-frequency" on projects.check_frequency_id = "check-frequency".id
left join projects_shared_links on projects.id = projects_shared_links.projects_id
left join shared_links on projects_shared_links.shared_links_id = shared_links.id
left join google_domains on projects.region_id = google_domains.id
left join locations on projects.location_id = locations.id
left join (
    select SUM(
    CASE WHEN desktop_types.name = '${
      DeviceTypesEnum.Desktop
    }' THEN 1 ELSE 0 END
    ) as desktop_type_count,
        SUM(
    CASE WHEN desktop_types.name = '${DeviceTypesEnum.Mobile}' THEN 1 ELSE 0 END
    ) as mobile_type_count,
    COUNT(keywords) as keywords_count,
    COALESCE(SUM(CASE WHEN keywords.position_update is true THEN 1 ELSE 0 END ), 0)::FLOAT as number_of_keywords_that_are_updated,
    keywords.project_id
    from keywords
left join desktop_types on keywords.device_type_id = desktop_types.id ${
        !keywordDeviceType ||
        keywordDeviceType === DeviceTypesEnum.DesktopAndMobile
          ? ''
          : 'where desktop_types.name = $3'
      }
                                      group by keywords.project_id
) as keywords_result on keywords_result.project_id =projects.id

left join languages on projects.language_id = languages.id
left join search_engines on projects.search_engine_id = search_engines.id
left join email_reports on projects.id = email_reports.project_id
left join triggers on projects.id = triggers.project_id
left join alerts on triggers.id = alerts.trigger_id
left join latest_project_overview on projects.id = latest_project_overview.project_id
where shared_links.link=$1 and projects.id=$2
group by projects.id,
         google_domains.id,
         languages.id,
         locations.id,
         search_engines.id,
         desktop_type_count,
         keywords_count,
         mobile_type_count,
         latest_project_overview.id,
         "check-frequency".id,
         keywords_result.number_of_keywords_that_are_updated`,

      !keywordDeviceType ||
        keywordDeviceType === DeviceTypesEnum.DesktopAndMobile
        ? [link, projectId]
        : [link, projectId, keywordDeviceType],
    );
    return result[0] ?? null;
  }

  /**
   * Updates the `updatedAt` field of projects with the given project IDs to the current date and time.
   *
   * @param {IdType[]} projectIds - An array of project IDs that need to be updated.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updateProjectsByProjectIds(projectIds: IdType[]): Promise<void> {
    await this.createQueryBuilder('projects')
      .update()
      .set({ updatedAt: new Date() })
      .where('projects.id in (:...projectIds)', { projectIds })
      .execute();
  }

  /**
   * Updates the `updatedAt` field to the current date for projects associated with the provided keyword IDs.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs used to identify the projects that need to be updated.
   * @return {Promise<void>} - A promise that resolves when the update operation is complete.
   */
  async updateProjectsByKeywordIds(keywordIds: IdType[]): Promise<void> {
    await this.createQueryBuilder('projects')
      .update()
      .set({ updatedAt: new Date() })
      .where((qb) => {
        qb.andWhere(
          'projects.id IN (SELECT DISTINCT p.id FROM projects p LEFT JOIN keywords k ON p.id = k.project_id WHERE k.id IN (:...keywordIds))',
          { keywordIds },
        );
      })
      .execute();
  }

  /**
   * Fetches a paginated list of projects associated with a given shared link.
   *
   * @param {string} link - The shared link associated with the projects.
   * @param {GetSharedRequest} options - The options for pagination, search, sorting, and filtering.
   * @param {string} options.search - A search query to filter projects by name.
   * @param {number} options.limit - The number of items to be returned per page.
   * @param {number} options.page - The current page number.
   * @param {string} options.sortBy - The field by which results should be sorted.
   * @param {string} options.sortOrder - The order in which results should be sorted (e.g., ASC or DESC).
   *
   * @return {Promise<Pagination<ProjectByLinkType>>} A promise that resolves to an object containing the paginated list of projects and meta information.
   */
  async paginatedProjectBySharedLink(
    link: string,
    options: GetSharedRequest,
  ): Promise<Pagination<ProjectByLinkType>> {
    const search = options.search ? ` and projects.project_name ILike($2)` : '';
    const countResult = await this.query(
      `select count(projects.id)
            from projects
            left join projects_shared_links on projects.id = projects_shared_links.projects_id
            left join shared_links on projects_shared_links.shared_links_id = shared_links.id
            where shared_links.link=$1 ${search} group by projects.id`,
      options.search ? [link, `%${options.search}%`] : [link],
    );
    const itemsPerPage = Number(options.limit);
    const currentPage = Number(options.page);
    const count = countResult[0]?.count ?? 0;
    const items = await this.query(
      `

SELECT
        CASE
            WHEN result.total_desktop > 0 AND result.total_mobile > 0 THEN '${
              DeviceTypesEnum.DesktopAndMobile
            }'
            ELSE CASE
                WHEN result.total_desktop > 0 AND result.total_mobile = 0 THEN '${
                  DeviceTypesEnum.Desktop
                }'
                ELSE '${DeviceTypesEnum.Mobile}'
            END
        END AS project_device_type,
        result.*,
        latest_project_overview.improved,
        latest_project_overview.declined,
        latest_project_overview.no_change,
        latest_project_overview.lost
    FROM (
select projects.id, projects.project_name,
       projects.url,
       projects.created_at,
       projects.updated_at,
       count(keywords) as total_keywords,
       COALESCE(SUM(CASE WHEN keywords.position_update is true THEN 1 ELSE 0 END ), 0)::FLOAT as number_of_keywords_that_are_updated,
SUM(
CASE WHEN desktop_types.name = 'Desktop' THEN 1 ELSE 0 END
) as total_desktop,
 SUM(
CASE WHEN desktop_types.name = 'Mobile' THEN 1 ELSE 0 END
) as total_mobile,

    "check-frequency".id as frequency_id,
    "check-frequency".name as frequency_name,
    google_domains.id as region_id,
    google_domains.name as region_name,
    google_domains.country_name as region_country_name,
    search_engines.id as search_engines_id,
    search_engines.name as search_engines_name

from projects
left join search_engines on projects.search_engine_id = search_engines.id
left join projects_shared_links on projects.id = projects_shared_links.projects_id
left join shared_links on projects_shared_links.shared_links_id = shared_links.id
left join keywords on projects.id = keywords.project_id
left join desktop_types on keywords.device_type_id = desktop_types.id
left join "check-frequency" on projects.check_frequency_id = "check-frequency".id
left join google_domains on projects.region_id = google_domains.id

where shared_links.link=$1 ${
        options.search ? 'and projects.project_name ILike($4)' : ''
      }

group by projects.id, "check-frequency".id, google_domains.id, search_engines.id) as result
LEFT JOIN latest_project_overview on result.id = latest_project_overview.project_id

ORDER BY ${
        options.sortBy
          ? getKeyByValue(SortProjectsByLinkEnum, options.sortBy)
          : 'result.project_name'
      } ${options.sortOrder}
OFFSET $2 LIMIT $3`,
      options.search
        ? [
            link,
            (currentPage - 1) * itemsPerPage,
            itemsPerPage,
            `%${options.search}%`,
          ]
        : [link, (currentPage - 1) * itemsPerPage, itemsPerPage],
    );

    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems: +count,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
        currentPage,
      },
    };
  }
  /**
   * Retrieves a list of available projects for a given user and account.
   * Optionally, a search string can be provided to filter the projects by name.
   *
   * @param {IdType} userId - The ID of the user for whom to fetch the available projects.
   * @param {IdType} accountId - The ID of the account to which the projects belong.
   * @param {string} [search] - Optional search string to filter projects by name.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects.
   */
  async getListAvailableProjects(
    userId: IdType,
    accountId: IdType,
    search?: string,
  ): Promise<ProjectEntity[]> {
    const searchQuery = search
      ? ' and projects.projectName ILike(:search)'
      : '';
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.users', 'users')
      .where(
        `users.id =:userId and projects.account_id =:accountId ${searchQuery}`,
        {
          userId,
          accountId,
          search: `%${search}%`,
        },
      )
      .orderBy('projects.projectName', 'ASC')
      .getMany();
  }

  /**
   * Retrieves a list of projects along with the count of their related entities.
   *
   * @param {IdType[]} projectIds - An array of project IDs to retrieve data for.
   * @return {Promise<Array<ProjectEntity & NumberOfEntitiesType>>} A promise that resolves to an array of projects,
   * each augmented with the number of related entities like competitors, notes, shared links, triggers, and email reports.
   */
  async getProjectsWithNumberOfEntities(
    projectIds: IdType[],
  ): Promise<Array<ProjectEntity & NumberOfEntitiesType>> {
    return (await this.createQueryBuilder('projects')
      .loadRelationCountAndMap(
        'projects.competitorsCount',
        'projects.competitors',
      )
      .loadRelationCountAndMap('projects.notesCount', 'projects.notes')
      .leftJoinAndSelect('projects.sharedLinks', 'sharedLinks')
      .loadRelationCountAndMap('projects.triggersCount', 'projects.triggers')
      .loadRelationCountAndMap(
        'projects.emailReportsCount',
        'projects.emailReports',
      )
      .where('projects.id in(:...projectIds)', { projectIds })
      .getMany()) as any;
  }

  /**
   * Fetches projects that are associated with the provided keyword IDs.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to filter projects by.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects whose associated keywords match the provided keyword IDs.
   */
  async getProjectsByKeywordIds(
    keywordIds: IdType[],
  ): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.keywords', 'keywords')
      .where('keywords.id in(:...keywordIds)', { keywordIds })
      .getMany();
  }

  /**
   * Retrieves projects by their IDs along with their associated folders.
   *
   * @param {IdType[]} projectIds - An array of project IDs to fetch.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects.
   */
  async getProjectsByIdsWithFolders(
    projectIds: IdType[],
  ): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.folders', 'folders')
      .where(`projects.id in(:...projectIds)`, {
        projectIds,
      })
      .getMany();
  }

  /**
   * Retrieves a list of project entities by their IDs.
   *
   * @param {IdType[]} projectIds - An array of project IDs to retrieve.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to a list of ProjectEntity objects.
   */
  async getProjectsByIds(projectIds: IdType[]): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.users', 'users')
      .where(`projects.id in(:...projectIds)`, {
        projectIds,
      })
      .getMany();
  }

  /**
   * Retrieves projects with their associated tags based on the given project IDs.
   *
   * @param {IdType[]} projectIds - An array of project IDs to filter the projects.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of ProjectEntity objects with their tags.
   */
  async getProjectsWithTags(projectIds: IdType[]): Promise<ProjectEntity[]> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.tags', 'tags')
      .where(`projects.id in(:...projectIds)`, {
        projectIds,
      })
      .getMany();
  }

  /**
   * Fetches project information for generating a PDF.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<ProjectInfoType & BrandingInfoType>} A promise that resolves to the project and branding information.
   */
  async getProjectInfoForPdf(
    projectId: IdType,
  ): Promise<ProjectInfoType & BrandingInfoType> {
    const result = await this.query(
      `
select *,       
CASE WHEN result.desktop_type_count > 0 AND result.mobile_type_count > 0 
            THEN '${DeviceTypesEnum.DesktopAndMobile}' ELSE
            CASE WHEN result.mobile_type_count = 0 AND result.desktop_type_count > 0 
                 THEN '${DeviceTypesEnum.Desktop}' ELSE '${DeviceTypesEnum.Mobile}' END
            END as keyword_project_type
from (
    select projects.id as id,
       projects.project_name as project_name,
       projects.business_name as business_name,
       projects.url as url,
       locations.location_name as location,
       google_domains.id as region_id,
       google_domains.name as region_name,
       google_domains.country_name as region_country_name,
       languages.id as language_id,
       languages.name as language_name,
       languages.code as language_code,
       search_engines.id as search_engine_id,
       search_engines.name as search_engine_name,
       keywords_result.desktop_type_count as desktop_type_count,
       keywords_result.keywords_count as keywords_count,
       keywords_result.mobile_type_count as mobile_type_count,
       latest_project_overview.update_date,
       latest_project_overview.previous_update_date,
       accounts.id as accounts_id,
       accounts.email_reports,
       accounts.company_name,
       accounts.company_url,
       accounts.facebook_link,
       accounts.linkedin_link,
       accounts.twitter_link,
       accounts.shared_links,
       accounts.tagline,
       accounts.validated_by_serpnest,
       storage_items.id as storage_items_id,
       storage_items.original_file_name as storage_items_original_file_name,
       storage_items.stored_file_name as storage_items_stored_file_name,
       storage_items.storage_path as storage_items_storage_path

from projects
left join accounts on projects.account_id = accounts.id
left join storage_items on accounts.company_logo_id = storage_items.id
left join google_domains on projects.region_id = google_domains.id
left join (
    select SUM(
    CASE WHEN desktop_types.name = '${DeviceTypesEnum.Desktop}' THEN 1 ELSE 0 END
    ) as desktop_type_count,
        SUM(
    CASE WHEN desktop_types.name = '${DeviceTypesEnum.Mobile}' THEN 1 ELSE 0 END
    ) as mobile_type_count,
    COUNT(keywords) as keywords_count,
    keywords.project_id
    from keywords
left join desktop_types on keywords.device_type_id = desktop_types.id
                                      group by keywords.project_id
) as keywords_result on keywords_result.project_id =projects.id
left join locations on projects.location_id = locations.id
left join languages on projects.language_id = languages.id
left join search_engines on projects.search_engine_id = search_engines.id
left join latest_project_overview on projects.id = latest_project_overview.project_id
where projects.id = $1
group by projects.id,
         google_domains.id,
         languages.id,
         search_engines.id,
         desktop_type_count,
         keywords_count,
         mobile_type_count,
         locations.id,
         latest_project_overview.id,
         accounts.id,
         storage_items.id) as result
      `,

      [projectId],
    );

    return result[0] ?? null;
  }

  /**
   * Retrieves detailed information about a specific project from the database.
   * This includes details such as project name, business name, location,
   * language, region, search engine, keyword counts, tag counts, update dates,
   * and other relevant project-related information.
   *
   * @param {PayloadProjectInfoType} payload - The payload containing the project ID
   * and account ID necessary to retrieve the project information. Additionally,
   * it may contain keywordDeviceType to filter the device type for keyword counts.
   * @return {Promise<ProjectInfoType>} A promise that resolves to a ProjectInfoType
   * object containing various details about the project. Returns null if no project
   * information is found.
   */
  async getProjectInfo(
    payload: PayloadProjectInfoType,
  ): Promise<ProjectInfoType> {
    const result = await this.query(
      `select projects.id as id,
       projects.project_name as project_name,
       projects.business_name as business_name,
       projects.updated_at as updated_at,
       projects.url as url,
       locations.location_name as location,
       google_domains.id as region_id,
       google_domains.name as region_name,
       google_domains.country_name as region_country_name,
       languages.id as language_id,
       languages.name as language_name,
       languages.code as language_code,
       search_engines.id as search_engine_id,
       search_engines.name as search_engine_name,
       COALESCE(keywords_result.keywords_count, 0)::FLOAT as keywords_count,
       (select COUNT(email_reports.id) from email_reports where project_id = $1)::FLOAT as email_report_count,
       (select COUNT(triggers.id) from triggers where triggers.project_id = $1)::FLOAT as trigger_count,
       TO_CHAR(latest_project_overview.update_date, 'YYYY-MM-DD') as update_date,
       TO_CHAR(latest_project_overview.previous_update_date, 'YYYY-MM-DD') as previous_update_date,
       CASE WHEN keywords_result.count_desktop_keywords > 0 AND keywords_result.count_mobile_keywords > 0 
            THEN '${DeviceTypesEnum.DesktopAndMobile}' ELSE
            CASE WHEN keywords_result.count_mobile_keywords = 0 AND keywords_result.count_desktop_keywords > 0 
                 THEN '${DeviceTypesEnum.Desktop}' ELSE '${
        DeviceTypesEnum.Mobile
      }' END
            END as keyword_project_type,
       "check-frequency".id as check_frequency_id,
       "check-frequency".name as check_frequency_name,
       count(projects_tags_projects_tags.projects_tags_id)::FLOAT as tag_count,
       keywords_result.number_of_keywords_that_are_updated as number_of_keywords_that_are_updated
from projects
left join projects_tags_projects_tags on projects.id = projects_tags_projects_tags.projects_id
left join google_domains on projects.region_id = google_domains.id
left join locations on locations.id = projects.location_id
left join (
    select 
    COUNT(keywords) as keywords_count,
    COUNT(keywords.id) FILTER ( WHERE desktop_types.name = 'Desktop' )::FLOAT as count_desktop_keywords,
    COUNT(keywords.id) FILTER ( WHERE desktop_types.name = 'Mobile' )::FLOAT as count_mobile_keywords,
    COALESCE(SUM(CASE WHEN keywords.position_update is true THEN 1 ELSE 0 END ), 0)::FLOAT as number_of_keywords_that_are_updated,
    keywords.project_id
    from keywords
left join desktop_types on keywords.device_type_id = desktop_types.id ${
        !payload.keywordDeviceType ||
        payload.keywordDeviceType === DeviceTypesEnum.DesktopAndMobile
          ? ''
          : 'where desktop_types.name = $3'
      }
                                      group by keywords.project_id
) as keywords_result on keywords_result.project_id =projects.id

left join languages on projects.language_id = languages.id
left join search_engines on projects.search_engine_id = search_engines.id
left join latest_project_overview on projects.id = latest_project_overview.project_id
left join "check-frequency" on projects.check_frequency_id = "check-frequency".id
where projects.id=$1 and projects.account_id =$2
group by projects.id,
         google_domains.id,
         languages.id,
         locations.id,
         "check-frequency".id,
         search_engines.id,
         keywords_count,
         latest_project_overview.id,
         count_desktop_keywords,
         count_mobile_keywords,
         keywords_result.number_of_keywords_that_are_updated`,
      !payload.keywordDeviceType ||
        payload.keywordDeviceType === DeviceTypesEnum.DesktopAndMobile
        ? [payload.id, payload.accountId]
        : [payload.id, payload.accountId, payload.keywordDeviceType],
    );
    return result[0] ?? null;
  }

  /**
   * Retrieves a project by its ID along with its associated search engine.
   *
   * @param {IdType} id - The unique identifier of the project.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity with its search engine.
   */
  async getProjectByIdWithSearchEngine(id: IdType): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .where('projects.id =:id', {
        id,
      })
      .getOne();
  }

  /**
   * Retrieves a project entity by its ID along with the associated keywords
   * where the keywords have manual update available and position update is false.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<ProjectEntity>} - A promise that resolves to the project entity with associated keywords.
   */
  async getProjectByIdWithKeywords(projectId: IdType): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.keywords', 'keywords')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .where(`projects.id =:projectId`, { projectId })
      .andWhere(`keywords.manualUpdateAvailable IS TRUE`)
      .andWhere('keywords.positionUpdate IS FALSE')
      .getOne();
  }

  /**
   * Retrieves a project by its ID along with associated folders.
   *
   * @param {IdType} id - The unique identifier of the project to be retrieved.
   * @return {Promise<Project>} A promise that resolves to the project object with its folders.
   */
  async getProjectByIdWithFolders(id: IdType) {
    return this.createQueryBuilder('projects')
      .leftJoinAndSelect('projects.folders', 'folders')
      .where('projects.id =:id', {
        id,
      })
      .getOne();
  }

  /**
   * Retrieves a project by its ID and associated account ID.
   *
   * @param {IdType} id - The ID of the project to retrieve.
   * @param {IdType} accountId - The ID of the account associated with the project.
   * @return {Promise<ProjectEntity>} A promise that resolves to the project entity matching the given IDs.
   */
  async getProjectByIdAndAccountId(
    id: IdType,
    accountId: IdType,
  ): Promise<ProjectEntity> {
    return this.createQueryBuilder('projects')
      .withDeleted()
      .leftJoinAndSelect('projects.account', 'account')
      .leftJoinAndSelect('account.timezone', 'timezone')
      .leftJoinAndSelect('projects.folders', 'folders')
      .leftJoinAndSelect('projects.language', 'language')
      .leftJoinAndSelect('projects.searchEngine', 'searchEngine')
      .leftJoinAndSelect('projects.checkFrequency', 'checkFrequency')
      .leftJoinAndSelect('projects.competitors', 'competitors')
      .leftJoinAndSelect('projects.notes', 'notes')
      .leftJoinAndSelect('notes.author', 'author')
      .leftJoinAndSelect('projects.tags', 'tags')
      .leftJoinAndSelect('projects.region', 'region')
      .where(`projects.id =:id and account.id =:accountId`, {
        id,
        accountId,
      })
      .getOne();
  }

  /**
   * Retrieves updated project data including counts of desktop and mobile types,
   * frequency details, and the latest project overview status for a given list of project IDs.
   *
   * @param {IdType[]} projectIds - An array of project IDs to retrieve data for.
   * @return {Promise<ProjectAvailableToUserType[]>} A promise that resolves to an array of
   * projects available to the user with updated data.
   */
  async getUpdatedProjectsWithData(
    projectIds: IdType[],
  ): Promise<ProjectAvailableToUserType[]> {
    return this.query(`
    SELECT
        CASE
            WHEN result.desktop_type_count > 0 AND result.mobile_type_count > 0 THEN '${
              DeviceTypesEnum.DesktopAndMobile
            }'
            ELSE CASE
                WHEN result.desktop_type_count > 0 AND result.mobile_type_count = 0 THEN '${
                  DeviceTypesEnum.Desktop
                }'
                ELSE '${DeviceTypesEnum.Mobile}'
            END
        END AS project_device_type,
        result.*,
        latest_project_overview.improved,
        latest_project_overview.declined,
        latest_project_overview.no_change,
        latest_project_overview.lost
    FROM (
        SELECT
            projects.id::FLOAT,
            projects.account_id,
            projects.project_name,
            projects.url,
            COALESCE(SUM(CASE WHEN dt.name = '${
              DeviceTypesEnum.Desktop
            }' THEN 1 ELSE 0 END), 0)::FLOAT AS desktop_type_count,
            COALESCE(SUM(CASE WHEN dt.name = '${
              DeviceTypesEnum.Mobile
            }' THEN 1 ELSE 0 END), 0)::FLOAT AS mobile_type_count,
            COALESCE(COUNT(keywords.id), 0)::FLOAT AS count,
            "check-frequency".id::FLOAT AS frequency_id,
            "check-frequency".name AS frequency_name,
            projects.created_at,
            projects.updated_at,
            google_domains.id::FLOAT AS region_id,
            google_domains.name AS region_name,
            google_domains.country_name AS region_country_name
        FROM
            projects
        LEFT JOIN
            accounts ON projects.account_id = accounts.id
        LEFT JOIN
            keywords ON projects.id = keywords.project_id
        LEFT JOIN
            "check-frequency" ON projects.check_frequency_id = "check-frequency".id
        LEFT JOIN
            google_domains ON projects.region_id = google_domains.id
        LEFT JOIN
            desktop_types AS dt ON keywords.device_type_id = dt.id
    where projects.id in(${projectIds.map((id) => id)})
        GROUP BY
            projects.id,
            projects.project_name,
            projects.url,
            "check-frequency".id,
            google_domains.id
    ) AS result
LEFT JOIN latest_project_overview on result.id = latest_project_overview.project_id
    `);
  }

  /**
   * Retrieves a paginated list of all projects available to a user within a specific account.
   *
   * @param {IdType} accountId - The ID of the account to which the projects belong.
   * @param {IdType} userId - The ID of the user requesting the projects.
   * @param {GetPaginatedProjectsAvailableToUserTypeRequest} options - The options for pagination, search, sort, and filters.
   * @return {Promise<Pagination<ProjectAvailableToUserType>>} A promise that resolves to the paginated list of projects available to the user.
   */
  async paginatedAllProjectsAvailableToUser(
    accountId: IdType,
    userId: IdType,
    options: GetPaginatedProjectsAvailableToUserTypeRequest,
  ): Promise<Pagination<ProjectAvailableToUserType>> {
    const itemsPerPage = Number(options.limit);
    const currentPage = Number(options.page);

    const result = await this.query(
      `select count(*) from projects
    inner join (
        select * from users_projects where users_id = $2
    ) as available_projects on projects.id = available_projects.projects_id
    where account_id = $1 and projects.project_name ILIKE $3`,
      [accountId, userId, options.search ? `%${options.search}%` : '%%'],
    );
    const count = result[0].count;
    const items = await this.query(
      `
    SELECT
        CASE
            WHEN result.desktop_type_count > 0 AND result.mobile_type_count > 0 THEN '${
              DeviceTypesEnum.DesktopAndMobile
            }'
            ELSE CASE
                WHEN result.desktop_type_count > 0 AND result.mobile_type_count = 0 THEN '${
                  DeviceTypesEnum.Desktop
                }'
                ELSE '${DeviceTypesEnum.Mobile}'
            END
        END AS project_device_type,
        result.*,
        latest_project_overview.improved,
        latest_project_overview.declined,
        latest_project_overview.no_change,
        latest_project_overview.lost
    FROM (
        SELECT
            projects.id,
            projects.project_name,
            projects.url,
            COALESCE(SUM(CASE WHEN dt.name = '${
              DeviceTypesEnum.Desktop
            }' THEN 1 ELSE 0 END), 0)::FLOAT AS desktop_type_count,
            COALESCE(SUM(CASE WHEN dt.name = '${
              DeviceTypesEnum.Mobile
            }' THEN 1 ELSE 0 END), 0)::FLOAT AS mobile_type_count,
            COALESCE(COUNT(keywords.id), 0)::FLOAT AS count,
            "check-frequency".id AS frequency_id,
            "check-frequency".name AS frequency_name,
            projects.created_at,
            projects.updated_at,
            google_domains.id AS region_id,
            google_domains.name AS region_name,
            google_domains.country_name AS region_country_name,
            search_engines.id AS search_engines_id,
            search_engines.name AS search_engines_name,
            COALESCE(SUM(CASE WHEN keywords.position_update is true THEN 1 ELSE 0 END ), 0)::FLOAT as number_of_keywords_that_are_updated
        FROM
            projects
        LEFT JOIN
            accounts ON projects.account_id = accounts.id
        LEFT JOIN
            search_engines on projects.search_engine_id = search_engines.id
        LEFT JOIN
            keywords ON projects.id = keywords.project_id
        LEFT JOIN
            "check-frequency" ON projects.check_frequency_id = "check-frequency".id
        LEFT JOIN
            google_domains ON projects.region_id = google_domains.id
        LEFT JOIN
            desktop_types AS dt ON keywords.device_type_id = dt.id
        INNER JOIN (
            SELECT * FROM users_projects WHERE users_id = $2
        ) AS available_projects ON projects.id = available_projects.projects_id
    ${
      options.tagIds && options.tagIds.length > 0
        ? 'left join projects_tags_projects_tags on projects.id = projects_tags_projects_tags.projects_id\n' +
          'left join projects_tags on projects_tags_projects_tags.projects_tags_id = projects_tags.id'
        : ''
    }
    where accounts.id = $1 and projects.project_name ILIKE $5 ${
      options.tagIds && options.tagIds.length > 0
        ? `and projects_tags.id IN(${options.tagIds.map((id) => id)})`
        : ''
    }
        GROUP BY
            projects.id,
            projects.project_name,
            projects.url,
            "check-frequency".id,
            google_domains.id,
            search_engines.id
    ) AS result
LEFT JOIN latest_project_overview on result.id = latest_project_overview.project_id
    order by ${
      options.sortBy
        ? `${getKeyByValue(SortProjectsEnum, options.sortBy)}`
        : 'result.project_name'
    } ${options.sortOrder}
    OFFSET $3 LIMIT $4;
        `,
      [
        accountId,
        userId,
        (currentPage - 1) * itemsPerPage,
        itemsPerPage,
        options.search ? `%${options.search}%` : '%%',
      ],
    );
    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems: +count ?? 0,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
        currentPage,
      },
    };
  }
}
