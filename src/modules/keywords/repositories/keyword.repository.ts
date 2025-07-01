import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';
import { ProjectOverviewType } from 'modules/projects/types/project-overview.type';
import { ImprovedVsDeclinedForDaysType } from 'modules/keywords/types/improved-vs-declined-for-days.type';
import { GetStatisticsType } from 'modules/projects/types/get-statistics.type';
import { KeywordTrendType } from 'modules/projects/types/keyword-trend.type';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { GetKeywordsWithKeywordPositionsType } from 'modules/keywords/types/get-keywords-with-keyword-positions.type';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { OverviewType } from 'modules/keywords/types/overview.type';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';
import { SortKeywordRankingsEnum } from 'modules/keywords/enums/sort-keyword-rankings.enum';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { GetProjectKeywordsType } from 'modules/common/types/get-project-keywords.type';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { GetProjectPerformanceType } from 'modules/keywords/types/get-project-performance.type';
import { SortingByPeriodsEnum } from 'modules/keywords/enums/sorting-by-periods.enum';
import { GroupedKeywordsByAccountType } from 'modules/keywords/types/grouped-keywords-by-account.type';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

@Injectable()
@EntityRepository(KeywordEntity)
export class KeywordRepository extends BaseRepository<KeywordEntity> {
  /**
   * Asynchronously retrieves the number of updated keywords for a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<number>} - A promise that resolves to the count of updated keywords.
   */
  async getNumberOfUpdatedKeywordsOfProject(
    projectId: IdType,
  ): Promise<number> {
    const result = await this.query(
      `select COUNT(id)::FLOAT as count from keywords where project_id = $1 and position_update is true`,
      [projectId],
    );
    return result[0].count;
  }

  /**
   * Retrieves grouped keywords by account, given a list of keyword IDs.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to group by account.
   * @return {Promise<GroupedKeywordsByAccountType[]>} - A promise that resolves to an array of grouped keywords by account.
   */
  async getGroupedKeywordsByAccount(
    keywordIds: IdType[],
  ): Promise<GroupedKeywordsByAccountType[]> {
    const keywords = await this.createQueryBuilder('keywords')
      .withDeleted()
      .innerJoin('keywords.project', 'project')
      .innerJoin('project.account', 'account')
      .select([
        'account.id AS "accountId"',
        'keywords.id::FLOAT AS "keywordId"',
      ])
      .where('keywords.id IN (:...keywordIds)', { keywordIds })
      .orderBy('account.id')
      .getRawMany();
    const groupedKeywords = keywords.reduce((acc, { accountId, keywordId }) => {
      const existingAccount = acc.find(
        (entry: { accountId: IdType }) => entry.accountId === accountId,
      );

      if (existingAccount) {
        existingAccount.keywordIds.push(keywordId);
      } else {
        acc.push({
          accountId,
          keywordIds: [keywordId],
        });
      }

      return acc;
    }, []);

    return groupedKeywords;
  }

  /**
   * Retrieves keywords associated with a specific search engine that have missed updates.
   *
   * @param {SearchEnginesEnum} searchEngine - The search engine whose keywords are to be retrieved.
   * @return {Promise<KeywordEntity[]>} A promise that resolves to an array of KeywordEntity objects that missed updates.
   */
  async getKeywordsBySearchEngineThatMissedUpdates(
    searchEngine: SearchEnginesEnum,
  ): Promise<KeywordEntity[]> {
    return this.createQueryBuilder('keywords')
      .select('keywords.id')
      .leftJoin('keywords.project', 'project')
      .leftJoin('project.searchEngine', 'searchEngine')
      .where(
        "keywords.positionUpdate IS TRUE and keywords.updatedAt < NOW() - INTERVAL '5 minutes' and searchEngine.name =:searchEngine",
        { searchEngine },
      )
      .getMany();
  }

  /**
   * Fetches a list of keywords available to a user in relation to a specific account.
   *
   * @param {IdType} accountId - The ID of the account to filter keywords by.
   * @param {IdType[]} keywordIds - The IDs of the keywords to fetch.
   * @param {IdType} [userId] - Optional ID of the user to filter keywords by.
   * @return {Promise<KeywordEntity[]>} A promise that resolves to an array of KeywordEntity objects.
   */
  async getKeywordsAvailableToUserInRelationToAccount(
    accountId: IdType,
    keywordIds: IdType[],
    userId?: IdType,
  ): Promise<KeywordEntity[]> {
    const queryBuilder = this.createQueryBuilder('keywords')
      .withDeleted()
      .leftJoin('keywords.project', 'project')
      .leftJoin('project.account', 'account')
      .where('keywords.id in(:...keywordIds) and account.id =:accountId', {
        keywordIds,
        accountId,
      });
    if (userId) {
      queryBuilder
        .leftJoin('project.users', 'users')
        .andWhere('users.id =:userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Eliminates repetitive keywords from a list based on existing keywords in a given project and device type.
   *
   * @param {IdType} projectId - The unique identifier for the project.
   * @param {string[]} keywordNames - Array of keyword names to be checked.
   * @param {DeviceTypesEnum} deviceType - The device type to consider for existing keywords.
   * @return {Promise<{ keyword: string }[]>} - A promise that resolves to an array of unique keywords that are not repetitive.
   */
  async eliminateRepetitiveKeywords(
    projectId: IdType,
    keywordNames: string[],
    deviceType: DeviceTypesEnum,
  ): Promise<{ keyword: string }[]> {
    const keywordNamesQuoted = keywordNames
      .map((name) => `'${name.toLowerCase()}'`)
      .join(', ');
    return this.query(
      `
WITH existing_keywords AS (
    SELECT keywords.name as keyword_name
    FROM keywords
    LEFT JOIN desktop_types ON keywords.device_type_id = desktop_types.id
    WHERE project_id = $1 AND desktop_types.name = '${deviceType}'
)
SELECT DISTINCT keyword
FROM unnest(ARRAY(SELECT DISTINCT unnest(ARRAY[${keywordNamesQuoted}]))) AS keyword(keyword)
WHERE keyword NOT IN (SELECT keyword_name FROM existing_keywords);
      `,
      [projectId],
    );
  }

  /**
   * Updates the `manual_update_available` field to TRUE for keywords that meet the following criteria:
   * 1. The hour and minute of their `last_update_date` match the current hour and minute (in UTC).
   * 2. Their `last_update_date` is more than one day old (in UTC).
   * 3. Their `manual_update_available` field is currently FALSE.
   *
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async allowManualUpdateForKeywords(): Promise<void> {
    await this.query(`
UPDATE keywords
SET manual_update_available = TRUE
WHERE EXTRACT(HOUR FROM keywords.last_update_date AT TIME ZONE 'UTC') = EXTRACT(HOUR FROM NOW() AT TIME ZONE 'UTC')
    AND EXTRACT(MINUTE FROM keywords.last_update_date AT TIME ZONE 'UTC') = EXTRACT(MINUTE FROM NOW() AT TIME ZONE 'UTC')
    AND DATE(DATE_ADD(keywords.last_update_date, INTERVAL '1 DAY') AT TIME ZONE 'UTC') <= DATE(NOW() AT TIME ZONE 'UTC')
    AND keywords.manual_update_available IS FALSE;
    `);
  }

  /**
   * Retrieves a list of keywords and associated account IDs for a given search engine
   * that are due for a scheduled update based on their last update date and check frequency.
   *
   * @param {SearchEnginesEnum} searchEngine - The search engine for which to get the keywords.
   * @return {Promise<{ id: IdType; account_id: IdType }[]>} - A promise that resolves to an array of objects,
   * each containing the keyword ID and the associated account ID.
   */
  async getKeywordsForSearchEngineForAScheduledUpdate(
    searchEngine: SearchEnginesEnum,
  ): Promise<{ id: IdType; account_id: IdType }[]> {
    return this.query(`
select keywords.id, projects.account_id
from keywords
join projects on keywords.project_id = projects.id
join search_engines on projects.search_engine_id = search_engines.id
join accounts on projects.account_id = accounts.id
join subscriptions on accounts.subscription_id = subscriptions.id
join subscription_statuses on subscriptions.status_id = subscription_statuses.id
join  "check-frequency" on projects.check_frequency_id = "check-frequency".id
where
    (current_timestamp - keywords.last_update_date >= INTERVAL '1 DAY' AND  "check-frequency".name = '${CheckFrequencyEnum.Hours24}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '2 DAY' AND "check-frequency".name = '${CheckFrequencyEnum.Every2Days}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '3 DAY' AND "check-frequency".name = '${CheckFrequencyEnum.Every3Days}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '7 DAY' AND "check-frequency".name = '${CheckFrequencyEnum.EveryWeek}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '1 MONTH' AND "check-frequency".name = '${CheckFrequencyEnum.EveryMonth}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '2 MONTH' AND "check-frequency".name = '${CheckFrequencyEnum.Every2Months}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '3 MONTH' AND "check-frequency".name = '${CheckFrequencyEnum.Every3Months}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '6 MONTH' AND "check-frequency".name = '${CheckFrequencyEnum.Every6Months}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
    OR
    (current_timestamp - keywords.last_update_date >= INTERVAL '1 YEAR' AND "check-frequency".name = '${CheckFrequencyEnum.EveryYear}' AND keywords.position_update is false AND subscription_statuses.name != '${SubscriptionStatusesEnum.deactivated}' AND search_engines.name = '${searchEngine}')
`);
  }

  /**
   * Starts the process of updating the keywords based on the provided IDs.
   *
   * @param {IdType[]} ids - An array of keyword IDs to be updated.
   * @param {boolean} [isManual=false] - A flag to indicate if the update is manual or automated. Defaults to `false`.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async startUpdatingKeywords(ids: IdType[], isManual = false): Promise<void> {
    for (const id of ids) {
      const keyword = await this.createQueryBuilder('keywords')
        .where('keywords.id =:id', { id })
        .getOne();
      if (isManual) {
        await this.createQueryBuilder('keywords')
          .update()
          .set({
            updatedAt: keyword.updatedAt,
            positionUpdate: true,
            lastUpdateDate: new Date(),
            manualUpdateAvailable: false,
          })
          .where('keywords.id in(:...ids)', { ids })
          .execute();
      } else {
        await this.createQueryBuilder('keywords')
          .update()
          .set({
            updatedAt: keyword.updatedAt,
            positionUpdate: true,
            lastUpdateDate: new Date(),
          })
          .where('keywords.id in(:...ids)', { ids })
          .execute();
      }
    }
  }

  /**
   * Retrieves keywords based on their names and the specified language.
   *
   * @param {string[]} keywordNames - An array of keyword names to search for.
   * @param {string} language - The language to filter the keywords.
   * @return {Promise<KeywordEntity[]>} - A promise that resolves to an array of KeywordEntity objects that match the given criteria.
   */
  async getKeywordsByNamesWithLanguageAndLocation(
    keywordNames: string[],
    language: string,
  ): Promise<KeywordEntity[]> {
    return this.createQueryBuilder('keywords')
      .leftJoinAndSelect('keywords.project', 'project')
      .leftJoinAndSelect('project.language', 'language')
      .where(
        'keywords.name in(:...keywordNames) and language.name =:language',
        {
          keywordNames,
          language,
        },
      )
      .getMany();
  }

  /**
   * Retrieves keywords by their IDs and associated project ID.
   *
   * @param {IdType[]} ids - An array of keyword IDs to be retrieved.
   * @param {IdType} projectId - The ID of the project to which the keywords belong.
   * @return {Promise<Keyword[]>} A promise that resolves with an array of keyword objects.
   */
  async getKeywordsByIdsAndProjectId(ids: IdType[], projectId: IdType) {
    return this.createQueryBuilder('keywords')
      .leftJoinAndSelect('keywords.project', 'project')
      .leftJoinAndSelect('keywords.keywordPosition', 'keywordPosition')
      .where('keywords.id in(:...ids) and project.id =:projectId', {
        ids,
        projectId,
      })
      .orderBy('keywordPosition.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Retrieves a paginated list of keywords associated with a specific project ID.
   *
   * @param {GetProjectKeywordsType} payload - An object containing project and account identifiers.
   * @param {PaginatedSearchRequest} options - Options for pagination and search criteria.
   * @return {Promise<Pagination<KeywordEntity>>} A promise that resolves to a pagination object containing the keyword entities.
   */
  async paginatedKeywordsByProjectId(
    payload: GetProjectKeywordsType,
    options: PaginatedSearchRequest,
  ): Promise<Pagination<KeywordEntity>> {
    const searchQuery = options.search
      ? 'AND keywords.name ILIKE (:search)'
      : '';
    const queryBuilder = this.createQueryBuilder('keywords')
      .withDeleted()
      .leftJoinAndSelect('keywords.project', 'project')
      .leftJoinAndSelect('keywords.deviceType', 'deviceType')
      .leftJoin('project.account', 'account')
      .where(
        `project.id =:projectId and account.id =:accountId ${searchQuery}`,
        {
          projectId: payload.projectId,
          accountId: payload.accountId,
          search: `%${options.search}%`,
        },
      )
      .orderBy('keywords.name', 'ASC');
    return paginate(queryBuilder, options);
  }

  /**
   * Initiates the updating process for the specified keywords by setting their positionUpdate field to true.
   *
   * @param {IdType[]} ids - An array of keyword IDs that need to be updated.
   * @return {Promise<void>} A promise that resolves once the update operation is complete.
   */
  async startUpdating(ids: IdType[]): Promise<void> {
    await this.createQueryBuilder('keywords')
      .update()
      .set({ positionUpdate: true })
      .where('keywords.id in(:...ids)', { ids })
      .execute();
  }

  /**
   * Stops the updating process for a set of keywords based on their IDs.
   *
   * @param {IdType[]} ids - An array of keyword ids for which the updating process needs to stop.
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  async stopUpdating(ids: IdType[]): Promise<void> {
    await this.createQueryBuilder('keywords')
      .update()
      .set({ positionUpdate: false })
      .where('keywords.id in(:...ids)', { ids })
      .execute();
  }

  /**
   * Updates the keywords with the given ids, setting their position update status and updating the last update date.
   *
   * @param {IdType[]} ids - An array of keyword IDs to be updated.
   * @param {boolean} positionUpdate - A flag indicating whether the position has been updated.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async uprateKeywords(ids: IdType[], positionUpdate: boolean): Promise<void> {
    await this.createQueryBuilder('keywords')
      .update()
      .set({ positionUpdate, lastUpdateDate: new Date() })
      .where('keywords.id in(:...ids)', { ids })
      .execute();
  }
  /**
   * Updates the positionUpdate status for keywords with the given IDs.
   *
   * @param {IdType[]} ids - An array of keyword IDs to be updated.
   * @param {boolean} positionUpdate - The new position update status to be set.
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  async updatePositionUpdate(
    ids: IdType[],
    positionUpdate: boolean,
  ): Promise<void> {
    await this.createQueryBuilder('keywords')
      .update()
      .set({ positionUpdate })
      .where('keywords.id in(:...ids)', { ids })
      .execute();
  }

  /**
   * Retrieves the number of projects' keywords that need to be manually updated.
   *
   * @param {IdType[]} projectIds - An array of project IDs to filter the keywords.
   * @return {Promise<number>} The count of keywords associated with the specified projects
   * that require manual updates and have not had a position update.
   */
  async getNumberOfProjectsKeywordsToUpdate(
    projectIds: IdType[],
  ): Promise<number> {
    return this.createQueryBuilder('keywords')
      .leftJoin('keywords.project', 'project')
      .where(`project.id in(:...projectIds)`, { projectIds })
      .andWhere(`keywords.manualUpdateAvailable IS TRUE`)
      .andWhere('keywords.positionUpdate IS FALSE')
      .getCount();
  }

  /**
   * Retrieves the number of keywords associated with the given list of project IDs.
   *
   * @param {IdType[]} projectIds - An array of project identifiers for which the keyword count is to be determined.
   * @return {Promise<number>} A promise that resolves to the count of keywords associated with the specified projects.
   */
  async getNumberOfProjectsKeywords(projectIds: IdType[]): Promise<number> {
    return this.createQueryBuilder('keywords')
      .leftJoin('keywords.project', 'project')
      .where(`project.id in(:...projectIds)`, { projectIds })
      .getCount();
  }

  /**
   * Retrieves the count of keywords that are available for manual updates but not for position updates.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to check for availability.
   * @return {Promise<number>} A promise that resolves to the number of keywords meeting the criteria.
   */
  async getNumberOfAvailableKeywordsToUpdate(
    keywordIds: IdType[],
  ): Promise<number> {
    return this.createQueryBuilder('keywords')
      .where('keywords.id in(:...keywordIds)', { keywordIds })
      .andWhere(`keywords.manualUpdateAvailable IS TRUE`)
      .andWhere('keywords.positionUpdate IS FALSE')
      .getCount();
  }
  /**
   * Fetches keywords that are eligible for manual update based on specific conditions.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to filter the keywords.
   * @return {Promise<KeywordEntity[]>} A promise that resolves to an array of KeywordEntity objects that meet the criteria.
   */
  async getKeywordsForManualUpdate(
    keywordIds: IdType[],
  ): Promise<KeywordEntity[]> {
    return this.createQueryBuilder('keywords')
      .where('keywords.id in(:...keywordIds)', { keywordIds })
      .andWhere(`keywords.manualUpdateAvailable IS TRUE`)
      .andWhere('keywords.positionUpdate IS FALSE')
      .getMany();
  }

  /**
   * Retrieves a keyword by its unique identifier.
   *
   * @param {IdType} id - The unique identifier of the keyword to retrieve.
   * @return {Promise<KeywordEntity>} A promise that resolves to the retrieved KeywordEntity.
   */
  async getKeywordById(id: IdType): Promise<KeywordEntity> {
    return this.findOne(id, {
      relations: [
        'project',
        'project.region',
        'project.competitors',
        'project.account',
        'project.searchEngine',
      ],
      withDeleted: true,
    });
  }
  /**
   * Retrieves keywords based on provided keyword IDs and their associated relations.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to filter the keywords.
   * @param {IdType} accountId - The ID of the account to which the keywords belong.
   * @param {IdType} projectId - The ID of the project to which the keywords are associated.
   * @return {Promise<KeywordEntity[]>} A promise that resolves to an array of KeywordEntity objects.
   */
  async getKeywordsByIdsAndRelations(
    keywordIds: IdType[],
    accountId: IdType,
    projectId: IdType,
  ): Promise<KeywordEntity[]> {
    return this.createQueryBuilder('keywords')
      .leftJoinAndSelect('keywords.project', 'project')
      .leftJoinAndSelect('keywords.deviceType', 'deviceType')
      .leftJoinAndSelect('project.region', 'region')
      .leftJoinAndSelect('project.language', 'language')
      .where(
        'keywords.id IN(:...keywordIds) and project.id =:projectId and project.account_id =:accountId',
        { keywordIds, projectId, accountId },
      )
      .getMany();
  }
  /**
   * Retrieves the performance metrics of a project within a given date range and for a specified device type.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {string} fromDate - The start date for the performance data in YYYY-MM-DD format.
   * @param {string} toDate - The end date for the performance data in YYYY-MM-DD format.
   * @param {DeviceTypesEnum} deviceType - The type of device for which the performance data is to be retrieved.
   *
   * @return {Promise<GetProjectPerformanceType[]>} A promise that resolves to an array of project performance data.
   */
  async getProjectPerformance(
    projectId: IdType,
    fromDate: string,
    toDate: string,
    deviceType: DeviceTypesEnum,
  ): Promise<GetProjectPerformanceType[]> {
    return this.query(
      `
select
    TO_CHAR(keyword_positions_for_day.update_date, 'YYYY-MM-DD') as date,
    ROUND(COALESCE(AVG(keyword_positions_for_day.position)FILTER ( WHERE keyword_positions_for_day.position <= 101 )::numeric, 0), 2)::FLOAT as avg
from keyword_positions_for_day
join keywords on keywords.id = keyword_positions_for_day.keyword_id
${
  deviceType !== DeviceTypesEnum.DesktopAndMobile
    ? 'left join desktop_types on keywords.device_type_id = desktop_types.id'
    : ''
}
where
    keywords.project_id = $1
    and keyword_positions_for_day.update_date >= $2
    and keyword_positions_for_day.update_date <= $3
    ${
      deviceType !== DeviceTypesEnum.DesktopAndMobile
        ? 'and desktop_types.name = $4'
        : ''
    }
group by keyword_positions_for_day.update_date
order by keyword_positions_for_day.update_date ASC`,
      deviceType !== DeviceTypesEnum.DesktopAndMobile
        ? [projectId, fromDate, toDate, deviceType]
        : [projectId, fromDate, toDate],
    );
  }

  /**
   * Retrieves keyword trend data for a specified project and date range.
   *
   * @param {Object} payload - An object containing the parameters for the query.
   * @param {string} payload.fromDate - The start date for retrieving trends.
   * @param {string} payload.toDate - The end date for retrieving trends.
   * @param {IdType} payload.projectId - The ID of the project.
   * @param {DeviceTypesEnum} payload.deviceType - The type of device to filter the trends.
   * @return {Promise<KeywordTrendType[]>} - A promise that resolves to an array of keyword trend objects.
   */
  async getKeywordTrends(payload: {
    fromDate: string;
    toDate: string;
    projectId: IdType;
    deviceType: DeviceTypesEnum;
  }): Promise<KeywordTrendType[]> {
    return this.query(
      `
select keyword_positions_for_day.update_date as date,
    COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
            keyword_positions_for_day.position > 0 AND keyword_positions_for_day.position < 4 )::FLOAT
        AS top3,
        COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
            keyword_positions_for_day.position > 3 AND keyword_positions_for_day.position < 11 )::FLOAT
        AS from_four_to_ten,
            COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
            keyword_positions_for_day.position > 10 AND keyword_positions_for_day.position < 21 )::FLOAT
        AS from_eleven_to_twenty,
              COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
            keyword_positions_for_day.position > 20 AND keyword_positions_for_day.position < 51 )::FLOAT
        AS from_twenty_one_to_fifty,
                COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
            keyword_positions_for_day.position > 50 AND keyword_positions_for_day.position < 101 )::FLOAT
        AS fifty_one_to_one_hundred,
                    COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
        keyword_positions_for_day.position = 101 )::FLOAT AS not_ranked,
        COUNT(keyword_positions_for_day.keyword_id)::FLOAT as total

from keyword_positions_for_day
left join keywords on keyword_positions_for_day.keyword_id = keywords.id
${
  payload.deviceType != DeviceTypesEnum.DesktopAndMobile
    ? 'left join desktop_types on keywords.device_type_id = desktop_types.id'
    : ''
}
where keywords.project_id = $1 
${
  payload.deviceType != DeviceTypesEnum.DesktopAndMobile
    ? 'AND desktop_types.name = $4'
    : ''
}
AND keyword_positions_for_day.update_date <= DATE($3) 
AND keyword_positions_for_day.update_date >= DATE($2)
group by keyword_positions_for_day.update_date
order by keyword_positions_for_day.update_date asc`,
      payload.deviceType !== DeviceTypesEnum.DesktopAndMobile
        ? [
            payload.projectId,
            payload.fromDate,
            payload.toDate,
            payload.deviceType,
          ]
        : [payload.projectId, payload.fromDate, payload.toDate],
    );
  }
  /**
   * Fetches and returns keyword statistics for the specified range of days, including improved, declined, no change, and lost statistics.
   *
   * @param {ImprovedVsDeclinedForDaysType} payload - The payload containing necessary details to query the statistics.
   * @param {string} payload.projectId - The ID of the project.
   * @param {string} payload.fromDate - The start date for the query in YYYY-MM-DD format.
   * @param {string} payload.toDate - The end date for the query in YYYY-MM-DD format.
   * @param {DeviceTypesEnum} payload.deviceType - The type of device to filter the keywords by. If not specified, defaults to 'DesktopAndMobile'.
   * @return {Promise<GetStatisticsType[]>} A promise that resolves to an array of statistics, each containing the date, improved count, declined count, no change count, and lost count.
   */
  async improvedVsDeclinedForDays(
    payload: ImprovedVsDeclinedForDaysType,
  ): Promise<GetStatisticsType[]> {
    return this.query(
      `
select keyword_positions_for_day.update_date as date,
    COUNT(keyword_positions_for_day.keyword_id) FILTER (
        WHERE
            keyword_positions_for_day.position < keyword_positions_for_day.previous_position
            OR
            (keyword_positions_for_day.previous_position is null AND keyword_positions_for_day.position < 101) )::FLOAT
        AS improved,
    COUNT(keywords.id) FILTER (
        WHERE keyword_positions_for_day.previous_position < keyword_positions_for_day.position
            AND keyword_positions_for_day.position < 101)::FLOAT
        AS declined,
    COUNT(keywords.id) FILTER (WHERE keyword_positions_for_day.previous_position = keyword_positions_for_day.position AND keyword_positions_for_day.position IS NOT NULL)::FLOAT AS no_change,
    COUNT(keywords.id) FILTER (WHERE keyword_positions_for_day.previous_position != keyword_positions_for_day.position AND keyword_positions_for_day.previous_position < 101 AND keyword_positions_for_day.position = 101)::FLOAT AS lost
from keyword_positions_for_day
left join keywords on keyword_positions_for_day.keyword_id = keywords.id
left join desktop_types on keywords.device_type_id = desktop_types.id
where keywords.project_id = $1
${
  payload.deviceType != DeviceTypesEnum.DesktopAndMobile
    ? 'AND desktop_types.name = $4'
    : ''
}
AND keyword_positions_for_day.update_date <= DATE($3) 
AND keyword_positions_for_day.update_date >= DATE($2)
group by keyword_positions_for_day.update_date
order by keyword_positions_for_day.update_date asc`,
      payload.deviceType !== DeviceTypesEnum.DesktopAndMobile
        ? [
            payload.projectId,
            payload.fromDate,
            payload.toDate,
            payload.deviceType,
          ]
        : [payload.projectId, payload.fromDate, payload.toDate],
    );
  }

  /**
   * Retrieves a keyword by its name and associated project ID.
   *
   * @param {string} name - The name of the keyword to retrieve.
   * @param {IdType} projectId - The ID of the project associated with the keyword.
   * @return {Promise<KeywordEntity>} A promise that resolves to the matching keyword entity.
   */
  async getKeywordByNameAndProjectId(
    name: string,
    projectId: IdType,
  ): Promise<KeywordEntity> {
    return this.createQueryBuilder('keywords')
      .leftJoinAndSelect('keywords.project', 'project')
      .where('project.id =:projectId and keywords.name =:name', {
        projectId,
        name,
      })
      .getOne();
  }

  /**
   * Retrieves a list of KeywordEntity objects for planned position updates based on the given array of keyword IDs.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs for which the planned position updates are to be fetched.
   * @return {Promise<KeywordEntity[]>} A promise that resolves to an array of KeywordEntity objects containing the keyword details along with related entities such as device type, project, account, location, language, search engine, and region.
   */
  async getKeywordsForPlannedPositionUpdates(
    keywordIds: IdType[],
  ): Promise<KeywordEntity[]> {
    return this.createQueryBuilder('keywords')
      .withDeleted()
      .leftJoinAndSelect('keywords.deviceType', 'deviceType')
      .leftJoinAndSelect('keywords.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('project.location', 'location')
      .leftJoinAndSelect('project.language', 'language')
      .leftJoinAndSelect('project.searchEngine', 'searchEngine')
      .leftJoinAndSelect('project.region', 'region')
      .where('keywords.id in(:...keywordIds)', { keywordIds })
      .getMany();
  }

  /**
   * Fetches keywords by their IDs and includes related project and competitors data.
   *
   * @param {IdType[]} ids - The array of keyword IDs to fetch.
   * @return {Promise<KeywordEntity[]>} - A promise that resolves to an array of KeywordEntity objects.
   */
  async getKeywordsByIds(ids: IdType[]): Promise<KeywordEntity[]> {
    return this.createQueryBuilder('keywords')
      .leftJoinAndSelect('keywords.project', 'project')
      .leftJoinAndSelect('project.competitors', 'competitors')
      .where('keywords.id in(:...ids) and keywords.positionUpdate IS FALSE', {
        ids,
      })
      .getMany();
  }

  /**
   * Retrieves an overview of keyword rankings for a project within a specified date range and device type.
   *
   * @param {ProjectOverviewType} payload - The payload containing the projectId, fromDate, toDate, and deviceType parameters.
   * @return {Promise<OverviewType>} A promise that resolves to an object containing statistics such as improved, declined, no_change, lost, top3, top10, top30, top100 keywords, and average positions for the given date range.
   */
  async getOverview(payload: ProjectOverviewType): Promise<OverviewType> {
    const fromDate = payload.fromDate;
    const toDate = payload.toDate;
    const result = await this.query(
      `
WITH first_period as (
SELECT keyword_positions_for_day.keyword_id,
       keyword_positions_for_day.update_date,
       keyword_positions_for_day.position
from keyword_positions_for_day
left join keywords on keyword_positions_for_day.keyword_id = keywords.id
${
  payload.deviceType !== DeviceTypesEnum.DesktopAndMobile
    ? 'left join desktop_types on keywords.device_type_id = desktop_types.id'
    : ''
}
WHERE keywords.project_id = $1 ${
        payload.deviceType != DeviceTypesEnum.DesktopAndMobile
          ? 'and desktop_types.name = $4'
          : ''
      }
and keyword_positions_for_day.update_date = DATE($3)),
last_period as (
    SELECT keyword_positions_for_day.update_date,
           keyword_positions_for_day.keyword_id,
           keyword_positions_for_day.position
    from keyword_positions_for_day
     left join keywords on keyword_positions_for_day.keyword_id = keywords.id
${
  payload.deviceType !== DeviceTypesEnum.DesktopAndMobile
    ? 'left join desktop_types on keywords.device_type_id = desktop_types.id'
    : ''
}
     where keywords.project_id = $1 ${
       payload.deviceType != DeviceTypesEnum.DesktopAndMobile
         ? 'and desktop_types.name = $4'
         : ''
     }
     and keyword_positions_for_day.update_date = DATE($2)
)
SELECT *,
       ROUND(ABS(result.avg_position_for_previous_period - result.avg_position), 2)::FLOAT AS avg_change,
       CASE WHEN result.avg_position_for_previous_period != 0 AND result.avg_position_for_previous_period - result.avg_position <= 0 THEN false ELSE true END as increasing_average_position,
       ROUND(avg_position, 2)::FLOAT as avg_position,
       avg_position_for_previous_period::FLOAT as avg_position_for_previous_period,
        TO_CHAR($3, 'YYYY-MM-DD') as to_date,
        TO_CHAR($2, 'YYYY-MM-DD') as from_date
FROM (SELECT
    COUNT(first_period.keyword_id) FILTER (
        WHERE
            first_period.position < last_period.position
            OR
            (last_period.position is null AND first_period.position < 101) )::FLOAT
        AS improved,
    COUNT(first_period.keyword_id) FILTER (
        WHERE last_period.position < first_period.position
            AND first_period.position < 101)::FLOAT
        AS declined,
    COUNT(first_period.keyword_id) FILTER (WHERE last_period.position = first_period.position AND first_period.position != 101)::FLOAT AS no_change,
    COUNT(first_period.keyword_id) FILTER (WHERE last_period.position != first_period.position AND last_period.position < 101 AND first_period.position = 101)::FLOAT AS lost,
    COUNT(first_period.keyword_id) FILTER(
        WHERE first_period.position < 4
    )::FLOAT as top3,
        COUNT(first_period.keyword_id) FILTER(
        WHERE first_period.position < 11
    )::FLOAT as top10,
           COUNT(first_period.keyword_id) FILTER(
        WHERE first_period.position < 31
    )::FLOAT as top30,
           COUNT(first_period.keyword_id) FILTER(
        WHERE first_period.position < 101
    )::FLOAT as top100,
    COUNT(first_period.keyword_id) FILTER(
        WHERE (last_period.position < 4 AND first_period.position > 3 )
                  OR
              (last_period.position < 4 AND first_period.position is null)
    )::FLOAT as top3_lost,
        COUNT(first_period.keyword_id) FILTER(
        WHERE (last_period.position > 3
                   AND last_period.position < 101
                   AND first_period.position < 4)
          OR (last_period.position is null
                    AND first_period.position < 4)
    )::FLOAT as top3_new,
            COUNT(first_period.keyword_id) FILTER(
        WHERE (
                last_period.position > 10
               AND last_period.position < 101
               AND first_period.position < 11)
          OR last_period.position is null
                 AND first_period.position < 11
    )::FLOAT as top10_new,
              COUNT(first_period.keyword_id) FILTER(
        WHERE (last_period.position < 11 AND first_period.position > 10 )
                  OR
              (last_period.position < 11 AND first_period.position is null)
    )::FLOAT as top10_lost,
            COUNT(first_period.keyword_id) FILTER(
        WHERE
                last_period.position > 30
                AND last_period.position < 101
                AND first_period.position < 31
            OR (last_period.position is null
                    AND first_period.position < 31)
    )::FLOAT as top30_new,
              COUNT(first_period.keyword_id) FILTER(
        WHERE (last_period.position < 31 AND first_period.position > 30 )
                  OR
              (last_period.position < 31 AND first_period.position is null)
    )::FLOAT as top30_lost,
    COUNT(first_period.keyword_id) FILTER(
        WHERE (last_period.position < 101 AND first_period.position > 100 )
                  OR
              (last_period.position < 101 AND first_period.position is null)
    )::FLOAT as top100_lost,

            COUNT(first_period.keyword_id) FILTER(
        WHERE (last_period.position > 100 AND first_period.position < 101)
          OR (last_period.position is null AND first_period.position < 101)
    )::FLOAT as top100_new,
    COALESCE(AVG(first_period.position)FILTER ( WHERE first_period.position <= 101 )::numeric, 0) as avg_position,
    COALESCE(AVG(last_period.position) FILTER ( WHERE last_period.position is not null AND last_period.position <= 101)::numeric, 0) as avg_position_for_previous_period
from first_period
left join last_period on first_period.keyword_id = last_period.keyword_id) as result
`,
      payload.deviceType != DeviceTypesEnum.DesktopAndMobile
        ? [payload.projectId, fromDate, toDate, payload.deviceType]
        : [payload.projectId, fromDate, toDate],
    );
    return (
      result[0] ?? {
        improved: 0,
        declined: 0,
        no_change: 0,
        lost: 0,
        top3: 0,
        top3_new: 0,
        top3_lost: 0,
        top10: 0,
        top10_new: 0,
        top10_lost: 0,
        top30: 0,
        top30_new: 0,
        top30_lost: 0,
        top100: 0,
        top100_new: 0,
        top100_lost: 0,
        avg: 0,
        avg_for_previous_period: 0,
        difference_in_progress: 0,
      }
    );
  }

  /**
   * Retrieves a keyword entity along with its last position based on the provided keyword ID.
   *
   * @param {IdType} keywordId - The unique identifier of the keyword.
   * @return {Promise<KeywordEntity>} A promise that resolves to the keyword entity with its last position.
   */
  async getKeywordWithLastPositionByKeywordId(
    keywordId: IdType,
  ): Promise<KeywordEntity> {
    return this.createQueryBuilder('keywords')
      .leftJoinAndSelect(
        'keywords.keywordPositionsForDay',
        'keywordPositionsForDay',
      )
      .where('keywords.id =:keywordId', {
        keywordId,
      })
      .orderBy('keywordPositionsForDay.createdAt', 'DESC')
      .getOne();
  }

  /**
   * Retrieves a list of keywords that are currently being updated, along with associated project and account information.
   *
   * @param {IdType[]} keywordIds - An array of keyword IDs to be checked for updates.
   * @return {Promise<{ project_id: IdType, count_true: number, count_false: number, account_id: IdType }[]>}
   * A promise that resolves to an array of objects, each containing the project ID, account ID,
   * and counts of keywords that have their position being updated (count_true) and not being updated (count_false).
   */
  async getKeywordsThatAreBeingUpdated(keywordIds: IdType[]): Promise<
    {
      project_id: IdType;
      count_true: number;
      count_false: number;
      account_id: IdType;
    }[]
  > {
    return this.query(
      `
WITH ProjectInfo AS (
    SELECT project_id
    FROM keywords
    WHERE id in (${keywordIds.map((i) => i)})
)
SELECT
    projects.id AS project_id,
    projects.account_id,
    COUNT(CASE WHEN keywords.position_update is true THEN 1 END) AS count_true,
    COUNT(CASE WHEN keywords.position_update is false THEN 1 END) AS count_false
FROM projects
LEFT JOIN keywords ON projects.id = keywords.project_id
WHERE projects.id IN (SELECT project_id FROM ProjectInfo)
GROUP BY projects.id
    `,
    );
  }
  /**
   * Retrieves the most recent keyword data for the given keyword IDs.
   *
   * @param {IdType[]} ids - An array of keyword IDs to retrieve the data for.
   * @return {Promise<GetKeywordsWithKeywordPositionsType[]>} A promise that resolves to an array containing the keyword data along with their positions over various time intervals.
   */
  async getUpToDateKeywordDataByIds(
    ids: IdType[],
  ): Promise<GetKeywordsWithKeywordPositionsType[]> {
    return this.query(`
WITH last_keyword_positions AS (
    SELECT
        DATE(MAX(keyword_positions_for_day.update_date)) as date,
        keyword_positions_for_day.keyword_id as keyword_id
    FROM
        keyword_positions_for_day
        join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.id IN (${ids.map((item) => item)})
    GROUP BY
        keyword_positions_for_day.keyword_id
),
first_keyword_positions AS (
    select DATE(MIN(keyword_positions_for_day.update_date)) as date,
           keyword_id
    from keyword_positions_for_day
    join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.id IN (${ids.map((item) => item)})
    group by keyword_id
),
best_keyword_positions AS (
    select MIN(keyword_positions_for_day.position) as position,
           keyword_id
    from keyword_positions_for_day
    join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.id IN (${ids.map((item) => item)})
    group by keyword_id
)
select *
from (select keywords.id::FLOAT as id,
       projects.account_id,
       keywords.name as name,
       keywords.updated_at as updated_at,
       keywords.cpc as cpc,
       keywords.position_update as position_update,
       keywords.search_volume::FLOAT as search_volume,
       desktop_types.id as device_type_id,
       desktop_types.name as device_type_name,
       last_result.position::FLOAT as position,
       last_keyword_positions.date as date,
       last_result.url,
       day1_result.position::FLOAT as day1_position,
       day1_result.update_date as day1_date,
       day7_result.position::FLOAT as day7_position,
       day7_result.update_date as day7_date,
       day30_result.position::FLOAT as day30_position,
       day30_result.update_date as day30_date,
       first_result.position::FLOAT as first_position,
       first_result.update_date as first_date,
       best_keyword_positions.position::FLOAT as best_position,
       CASE WHEN last_result.position < 101 THEN
            CASE WHEN first_result.position < 101 THEN ABS(last_result.position - first_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN first_result.position < 101 THEN 100 - first_result.position ELSE  0 END
        END::FLOAT as life_difference,
       CASE WHEN first_result.position = 101 AND last_result.position = 101 THEN true ELSE false END as life_dash,
       CASE WHEN first_result.position < 101
            THEN CASE WHEN last_result.position < 101 THEN last_result.position < first_result.position ELSE false END
        ELSE
            CASE WHEN last_result.position < 101 THEN true ELSE false END
        END as life_is_improved,
        CASE WHEN first_result.position < 101
            THEN CASE WHEN last_result.position < 101 THEN last_result.position > first_result.position ELSE true END
        ELSE
            CASE WHEN last_result.position < 101 THEN false ELSE false END
        END as life_is_declined,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN ABS(last_result.position - day1_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day1_result.position < 101 THEN 100 - day1_result.position ELSE  0 END
        END::FLOAT as day1_difference,
        CASE WHEN day1_result is null AND last_result.position <= 101 THEN true ELSE false END day1_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN last_result.position < day1_result.position ELSE true END
        ELSE
            false
        END as day1_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN last_result.position > day1_result.position ELSE false END
            ELSE
            CASE WHEN day1_result.position < 101 THEN true ELSE false END
        END as day1_is_declined,
     CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN ABS(last_result.position - day7_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day7_result.position < 101 THEN 100 - day7_result.position ELSE  0 END
        END::FLOAT as day7_difference,
        CASE WHEN day7_result is null AND last_result.position <= 101 THEN true ELSE false END day7_result_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN last_result.position < day7_result.position ELSE true END
        ELSE
            false
        END as day7_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN last_result.position > day7_result.position ELSE false END
            ELSE
            CASE WHEN day7_result.position < 101 THEN true ELSE false END
        END as day7_is_declined,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN ABS(last_result.position - day30_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day30_result.position < 101 THEN 100 - day30_result.position ELSE  0 END
        END::FLOAT as day30_difference,
        CASE WHEN day30_result is null AND last_result.position <= 101 THEN true ELSE false END day30_result_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN last_result.position < day30_result.position ELSE true END
        ELSE
            false
        END as day30_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN last_result.position > day30_result.position ELSE false END
            ELSE
            CASE WHEN day30_result.position < 101 THEN true ELSE false END
        END as day30_is_declined,
      CASE WHEN last_result.position < 101 AND day1_result.position IS NOT NULL THEN
          CASE WHEN day1_result.position = 101 THEN true ELSE false END
          ELSE
          CASE WHEN day7_result.position IS NOT NULL THEN
              CASE WHEN day7_result.position = 101 THEN true ELSE false END
              ELSE
              CASE WHEN day30_result.position IS NOT NULL THEN
                  CASE WHEN day30_result.position = 101 THEN true ELSE false END
                  ELSE
                  CASE WHEN first_result.position = 101 THEN true ELSE false END
                  END
              END
          END as position_green_check_mark,
        CASE WHEN best_keyword_positions.position = last_result.position AND best_keyword_positions.position < 101 AND last_result.position < 101 AND day1_result.position != 101 AND day1_result IS NOT NULL THEN true ELSE false  END as position_trophy,
        keywords.manual_update_available as update_allowed,
        CASE WHEN first_result is null THEN true ELSE false END as first_position_dash,
        CASE WHEN last_result is null THEN true ELSE false END  as position_dash,
        projects.url as project_domain
from keywords
left join last_keyword_positions on keywords.id = last_keyword_positions.keyword_id
left join keyword_positions_for_day as last_result on last_keyword_positions.keyword_id = last_result.keyword_id and last_result.update_date = last_keyword_positions.date
left join keyword_positions_for_day as day1_result on keywords.id = day1_result.keyword_id AND day1_result.update_date = last_result.update_date - INTERVAL '1 days'
left join keyword_positions_for_day as day7_result on keywords.id = day7_result.keyword_id AND day7_result.update_date = last_result.update_date - INTERVAL '7 days'
left join keyword_positions_for_day as day30_result on keywords.id = day30_result.keyword_id AND day30_result.update_date = last_result.update_date - INTERVAL '30 days'
left join first_keyword_positions on first_keyword_positions.keyword_id = keywords.id
left join keyword_positions_for_day as first_result on first_result.keyword_id = keywords.id AND first_result.update_date = first_keyword_positions.date
left join best_keyword_positions on keywords.id = best_keyword_positions.keyword_id
join projects on keywords.project_id = projects.id
join desktop_types on keywords.device_type_id = desktop_types.id
where keywords.id in (${ids.map((item) => item)})
order by day1_difference DESC
) as result`);
  }

  /**
   * Retrieves keywords with their respective positions based on the provided filters, sorting, and pagination options.
   *
   * @param {IdType} projectId - The ID of the project for which to retrieve keyword positions.
   * @param {PaginatedSearchRequest & { sortOrder: SortOrderEnum; sortBy: SortKeywordRankingsEnum; }} options - Pagination and sorting options.
   * @param {{
   *   top3: BooleanEnum;
   *   top10: BooleanEnum;
   *   top30: BooleanEnum;
   *   top100: BooleanEnum;
   *   improved: BooleanEnum;
   *   declined: BooleanEnum;
   *   notRanked: BooleanEnum;
   *   noChange: BooleanEnum;
   *   lost: BooleanEnum;
   *   tagIds?: IdType[];
   * }} filter - Filters to apply when retrieving keyword positions.
   * @param {DeviceTypesEnum} deviceType - The type of device for which to retrieve keyword positions.
   * @return {Promise<Pagination<GetKeywordsWithKeywordPositionsType>>} A paginated list of keywords with their respective positions.
   */
  async getKeywordsWithKeywordPositions(
    projectId: IdType,
    options: PaginatedSearchRequest & {
      sortOrder: SortOrderEnum;
      sortBy: SortKeywordRankingsEnum;
    },
    filter: {
      top3: BooleanEnum;
      top10: BooleanEnum;
      top30: BooleanEnum;
      top100: BooleanEnum;
      improved: BooleanEnum;
      declined: BooleanEnum;
      notRanked: BooleanEnum;
      noChange: BooleanEnum;
      lost: BooleanEnum;
      tagIds?: IdType[];
    },
    deviceType: DeviceTypesEnum,
  ): Promise<Pagination<GetKeywordsWithKeywordPositionsType>> {
    let filterQuery = ``;
    let filterByResult = '';
    if (filter.top100 === BooleanEnum.TRUE) {
      filterQuery = `and last_result.position <= 100`;
    } else if (filter.top30 === BooleanEnum.TRUE) {
      filterQuery = `and last_result.position <= 30`;
    } else if (filter.top10 === BooleanEnum.TRUE) {
      filterQuery = `and last_result.position <= 10`;
    } else if (filter.top3 === BooleanEnum.TRUE) {
      filterQuery = `and last_result.position <= 3`;
    }
    if (filter.improved === BooleanEnum.TRUE) {
      filterByResult = `
where
     (CASE WHEN day1_result is true AND day1_difference != 0 THEN day1_is_improved is true ELSE
        CASE WHEN day7_result is true AND day7_difference != 0 THEN day7_is_improved is true ELSE
            CASE WHEN day30_result is true AND day30_difference != 0 THEN day30_is_improved is true ELSE
            life_is_improved is true
            END
        END
    END)
      `;
    }

    if (filter.noChange === BooleanEnum.TRUE) {
      filterByResult =
        filterByResult === ''
          ? `
where
   (CASE WHEN day1_result is true THEN day1_difference = 0 and result.position < 101 ELSE
      CASE WHEN day7_result is true THEN day7_difference = 0 and result.position < 101 ELSE
          CASE WHEN day30_result is true THEN day30_difference = 0 and result.position < 101 ELSE
          life_difference = 0 and result.position < 101
          END
      END
  END)    
          `
          : `
${filterByResult} OR
   (CASE WHEN day1_result is true THEN day1_difference = 0 and result.position < 101 ELSE
      CASE WHEN day7_result is true THEN day7_difference = 0 and result.position < 101 ELSE
          CASE WHEN day30_result is true THEN day30_difference = 0 and result.position < 101 ELSE
          life_difference = 0 and result.position < 101
          END
      END
  END)
      `;
    }

    if (filter.declined === BooleanEnum.TRUE) {
      filterByResult =
        filterByResult === ''
          ? `
where
   (CASE WHEN day1_result is true AND day1_difference != 0 THEN day1_is_declined is true and position < 101 ELSE
      CASE WHEN day7_result is true AND day7_difference != 0 THEN day7_is_declined is true and position < 101 ELSE
          CASE WHEN day30_result is true AND day30_difference != 0 THEN day30_is_declined is true and position < 101 ELSE
          life_is_declined is true and position < 101
          END
      END
  END)    
          `
          : `
${filterByResult} OR
   (CASE WHEN day1_result is true AND day1_difference != 0 THEN day1_is_declined is true and position < 101 ELSE
      CASE WHEN day7_result is true AND day7_difference != 0 THEN day7_is_declined is true and position < 101 ELSE
          CASE WHEN day30_result is true AND day30_difference != 0 THEN day30_is_declined is true and position < 101 ELSE
          life_is_declined is true and position < 101
          END
      END
  END)
      `;
    }
    if (filter.notRanked === BooleanEnum.TRUE) {
      filterByResult =
        filterByResult === ''
          ? `where (CASE WHEN day1_result is true AND day1_difference = 0 THEN result.position = 101 and day1_is_declined is false ELSE
      CASE WHEN day7_result is true AND day7_difference = 0 THEN result.position = 101 and day7_is_declined is false ELSE
          CASE WHEN day30_result is true AND day30_difference = 0 THEN result.position = 101 and day30_is_declined is false ELSE
          result.position = 101 and life_is_declined is false
          END
      END
  END)`
          : `${filterByResult} OR 
(CASE WHEN day1_result is true AND day1_difference = 0 THEN result.position = 101 and day1_is_declined is false ELSE
      CASE WHEN day7_result is true AND day7_difference = 0 THEN result.position = 101 and day7_is_declined is false ELSE
          CASE WHEN day30_result is true AND day30_difference = 0 THEN result.position = 101 and day30_is_declined is false ELSE
          result.position = 101 and life_is_declined is false
          END
      END
  END)
          `;
    } else if (filter.lost === BooleanEnum.TRUE) {
      filterByResult =
        filterByResult === ''
          ? `
where
   (CASE WHEN day1_result is true AND day1_difference != 0 THEN day1_is_declined is true and position > 100 ELSE
      CASE WHEN day7_result is true AND day7_difference != 0 THEN day7_is_declined is true and position > 100 ELSE
          CASE WHEN day30_result is true AND day30_difference != 0 THEN day30_is_declined is true and position > 100 ELSE
          life_is_declined is true and position > 100
          END
      END
  END)`
          : `
${filterByResult} OR
   (CASE WHEN day1_result is true AND day1_difference != 0 THEN day1_is_declined is true and position > 100 ELSE
      CASE WHEN day7_result is true AND day7_difference != 0 THEN day7_is_declined is true and position > 100 ELSE
          CASE WHEN day30_result is true AND day30_difference != 0 THEN day30_is_declined is true and position > 100 ELSE
          life_is_declined is true and position > 100
          END
      END
  END)
      `;
    }

    const result = await this.query(
      `
WITH last_keyword_positions AS (
    SELECT
        DATE(MAX(keyword_positions_for_day.update_date)) as date,
        keyword_positions_for_day.keyword_id as keyword_id
    FROM
        keyword_positions_for_day
        join keywords on keyword_positions_for_day.keyword_id = keywords.id
    WHERE keywords.project_id = $1
    GROUP BY
        keyword_positions_for_day.keyword_id
),
first_keyword_positions AS (
    select DATE(MIN(keyword_positions_for_day.update_date)) as date,
           keyword_id
    from keyword_positions_for_day
    join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.project_id = $1
    group by keyword_id
),
best_keyword_positions AS (
    select MIN(position) as position,
           keyword_positions_for_day.keyword_id
    from keyword_positions_for_day
    join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.project_id = $1
    group by keyword_id
)
select *
from (select DISTINCT keywords.id as id,
       keywords.name as name,
       keywords.updated_at as updated_at,
       keywords.cpc as cpc,
       keywords.position_update as position_update,
       keywords.search_volume::FLOAT as search_volume,
       desktop_types.id as device_type_id,
       desktop_types.name as device_type_name,
       last_result.position::FLOAT as position,
       last_keyword_positions.date as date,
       last_result.url,
       day1_result.position::FLOAT as day1_position,
       day1_result.update_date as day1_date,
       day7_result.position::FLOAT as day7_position,
       day7_result.update_date as day7_date,
       day30_result.position::FLOAT as day30_position,
       day30_result.update_date as day30_date,
       first_result.position::FLOAT as first_position,
       first_result.update_date as first_date,
       best_keyword_positions.position::FLOAT as best_position,
       CASE WHEN day1_result is not null THEN true ELSE false END as day1_result,
       CASE WHEN day7_result is not null THEN true ELSE false END as day7_result,
       CASE WHEN day30_result is not null THEN true ELSE false END as day30_result,
       CASE WHEN last_result.position < 101 THEN
            CASE WHEN first_result.position < 101 THEN ABS(last_result.position - first_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN first_result.position < 101 THEN 100 - first_result.position ELSE  0 END
        END::FLOAT as life_difference,
       CASE WHEN first_result.position = 101 AND last_result.position = 101 THEN true ELSE false END as life_dash,
       CASE WHEN first_result.position < 101
            THEN CASE WHEN last_result.position < 101 THEN last_result.position < first_result.position ELSE false END
        ELSE
            CASE WHEN last_result.position < 101 THEN true ELSE false END
        END as life_is_improved,
        CASE WHEN first_result.position < 101
            THEN CASE WHEN last_result.position < 101 THEN last_result.position > first_result.position ELSE true END
        ELSE
            CASE WHEN last_result.position < 101 THEN false ELSE false END
        END as life_is_declined,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN ABS(last_result.position - day1_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day1_result.position < 101 THEN 100 - day1_result.position ELSE  0 END
        END::FLOAT as day1_difference,
        CASE WHEN day1_result is null AND last_result.position <= 101 THEN true ELSE false END day1_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN last_result.position < day1_result.position ELSE true END
        ELSE
            false
        END as day1_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN last_result.position > day1_result.position ELSE false END
            ELSE
            CASE WHEN day1_result.position < 101 THEN true ELSE false END
        END as day1_is_declined,
     CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN ABS(last_result.position - day7_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day7_result.position < 101 THEN 100 - day7_result.position ELSE  0 END
        END::FLOAT as day7_difference,
        CASE WHEN day7_result is null AND last_result.position <= 101 THEN true ELSE false END day7_result_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN last_result.position < day7_result.position ELSE true END
        ELSE
            false
        END as day7_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN last_result.position > day7_result.position ELSE false END
            ELSE
            CASE WHEN day7_result.position < 101 THEN true ELSE false END
        END as day7_is_declined,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN ABS(last_result.position - day30_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day30_result.position < 101 THEN 100 - day30_result.position ELSE  0 END
        END::FLOAT as day30_difference,
        CASE WHEN day30_result is null AND last_result.position <= 101 THEN true ELSE false END day30_result_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN last_result.position < day30_result.position ELSE true END
        ELSE
            false
        END as day30_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN last_result.position > day30_result.position ELSE false END
            ELSE
            CASE WHEN day30_result.position < 101 THEN true ELSE false END
        END as day30_is_declined,
      CASE WHEN last_result.position < 101 AND day1_result.position IS NOT NULL THEN
          CASE WHEN day1_result.position = 101 THEN true ELSE false END
          ELSE
          CASE WHEN day7_result.position IS NOT NULL THEN
              CASE WHEN day7_result.position = 101 THEN true ELSE false END
              ELSE
              CASE WHEN day30_result.position IS NOT NULL THEN
                  CASE WHEN day30_result.position = 101 THEN true ELSE false END
                  ELSE
                  CASE WHEN first_result.position = 101 THEN true ELSE false END
                  END
              END
          END as position_green_check_mark,
        CASE WHEN best_keyword_positions.position = last_result.position AND best_keyword_positions.position < 101 AND last_result.position < 101 AND day1_result.position != 101 AND day1_result IS NOT NULL THEN true ELSE false  END as position_trophy,
        keywords.manual_update_available as update_allowed,
        CASE WHEN first_result is null THEN true ELSE false END as first_position_dash,
        CASE WHEN last_result is null THEN true ELSE false END  as position_dash,
        projects.url as project_domain
from keywords
${
  filter.tagIds?.length > 0
    ? 'left join keywords_tags_keywords_tags on keywords.id = keywords_tags_keywords_tags.keywords_id'
    : ''
}
left join last_keyword_positions on keywords.id = last_keyword_positions.keyword_id
left join keyword_positions_for_day as last_result on last_keyword_positions.keyword_id = last_result.keyword_id and last_result.update_date = last_keyword_positions.date
left join keyword_positions_for_day as day1_result on keywords.id = day1_result.keyword_id AND day1_result.update_date = last_result.update_date - INTERVAL '1 days'
left join keyword_positions_for_day as day7_result on keywords.id = day7_result.keyword_id AND day7_result.update_date = last_result.update_date - INTERVAL '7 days'
left join keyword_positions_for_day as day30_result on keywords.id = day30_result.keyword_id AND day30_result.update_date = last_result.update_date - INTERVAL '30 days'
left join first_keyword_positions on first_keyword_positions.keyword_id = keywords.id
left join keyword_positions_for_day as first_result on first_result.keyword_id = keywords.id AND first_result.update_date = first_keyword_positions.date
left join best_keyword_positions on keywords.id = best_keyword_positions.keyword_id
join desktop_types on keywords.device_type_id = desktop_types.id
join projects on keywords.project_id = projects.id
where keywords.project_id = $1 AND keywords.name ILIKE $2 ${
        filter.tagIds?.length > 0
          ? `and keywords_tags_keywords_tags.keywords_tags_id in (${filter.tagIds.map(
              (id) => id,
            )})`
          : ''
      } 
    ${
      deviceType != DeviceTypesEnum.DesktopAndMobile
        ? 'and desktop_types.name = $3'
        : ''
    } 
    ${filterQuery}
) as result ${filterByResult}
order by ${
        options.sortBy
          ? ['d1', 'd7', 'd30', 'life'].includes(options.sortBy)
            ? getKeyByValue(
                SortingByPeriodsEnum,
                `${options.sortBy}_${options.sortOrder.toLowerCase()}`,
              )
            : getKeyByValue(SortKeywordRankingsEnum, options.sortBy)
          : 'CASE\n' +
            'WHEN day1_is_improved AND day1_position is not null THEN 0 ELSE 1 END ASC,' +
            'CASE\n' +
            '        WHEN day1_difference > 0 AND day1_position is not null THEN -day1_difference\n' +
            '        ELSE position\n' +
            '    END ASC,\n' +
            '    CASE\n' +
            '        WHEN day1_difference = 0 THEN position\n' +
            '    END ASC\n' +
            ',\n' +
            '         CASE WHEN day7_difference > 0 THEN -day7_difference ELSE position END ASC,\n' +
            '         CASE WHEN day30_difference > 0 THEN -day30_difference ELSE position END ASC,\n' +
            '         CASE WHEN life_difference > 0 THEN -life_difference ELSE position\n' +
            '            END ASC,\n' +
            '    position ASC'
      } ${
        options.sortBy
          ? ['d1', 'd7', 'd30', 'life'].includes(options.sortBy)
            ? ''
            : options.sortOrder
          : ''
      }`,
      deviceType !== DeviceTypesEnum.DesktopAndMobile
        ? [projectId, options.search ? `%${options.search}%` : '%%', deviceType]
        : [projectId, options.search ? `%${options.search}%` : '%%'],
    );
    const count = result.length ?? 0;

    const itemsPerPage = Number(options.limit);
    const currentPage = Number(options.page);

    const items = await this.query(
      `
WITH last_keyword_positions AS (
    SELECT
        DATE(MAX(keyword_positions_for_day.update_date)) as date,
        keyword_positions_for_day.keyword_id as keyword_id
    FROM
        keyword_positions_for_day
        join keywords on keyword_positions_for_day.keyword_id = keywords.id
    WHERE keywords.project_id = $1
    GROUP BY
        keyword_positions_for_day.keyword_id
),
first_keyword_positions AS (
    select DATE(MIN(keyword_positions_for_day.update_date)) as date,
           keyword_id
    from keyword_positions_for_day
    join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.project_id = $1
    group by keyword_id
),
best_keyword_positions AS (
    select MIN(position) as position,
           keyword_positions_for_day.keyword_id
    from keyword_positions_for_day
    join keywords on keyword_positions_for_day.keyword_id = keywords.id
    where keywords.project_id = $1
    group by keyword_id
)
select *
from (select DISTINCT keywords.id as id,
       keywords.name as name,
       keywords.updated_at as updated_at,
       keywords.cpc as cpc,
       keywords.position_update as position_update,
       keywords.search_volume::FLOAT as search_volume,
       desktop_types.id as device_type_id,
       desktop_types.name as device_type_name,
       last_result.position::FLOAT as position,
       last_keyword_positions.date as date,
       last_result.url,
       day1_result.position::FLOAT as day1_position,
       day1_result.update_date as day1_date,
       day7_result.position::FLOAT as day7_position,
       day7_result.update_date as day7_date,
       day30_result.position::FLOAT as day30_position,
       day30_result.update_date as day30_date,
       first_result.position::FLOAT as first_position,
       first_result.update_date as first_date,
       best_keyword_positions.position::FLOAT as best_position,
       CASE WHEN day1_result is not null THEN true ELSE false END as day1_result,
       CASE WHEN day7_result is not null THEN true ELSE false END as day7_result,
       CASE WHEN day30_result is not null THEN true ELSE false END as day30_result,
       CASE WHEN last_result.position < 101 THEN
            CASE WHEN first_result.position < 101 THEN ABS(last_result.position - first_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN first_result.position < 101 THEN 100 - first_result.position ELSE  0 END
        END::FLOAT as life_difference,
       CASE WHEN first_result.position = 101 AND last_result.position = 101 THEN true ELSE false END as life_dash,
       CASE WHEN first_result.position < 101
            THEN CASE WHEN last_result.position < 101 THEN last_result.position < first_result.position ELSE false END
        ELSE
            CASE WHEN last_result.position < 101 THEN true ELSE false END
        END as life_is_improved,
        CASE WHEN first_result.position < 101
            THEN CASE WHEN last_result.position < 101 THEN last_result.position > first_result.position ELSE true END
        ELSE
            CASE WHEN last_result.position < 101 THEN false ELSE false END
        END as life_is_declined,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN ABS(last_result.position - day1_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day1_result.position < 101 THEN 100 - day1_result.position ELSE  0 END
        END::FLOAT as day1_difference,
        CASE WHEN day1_result is null AND last_result.position <= 101 THEN true ELSE false END day1_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN last_result.position < day1_result.position ELSE true END
        ELSE
            false
        END as day1_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day1_result.position < 101 THEN last_result.position > day1_result.position ELSE false END
            ELSE
            CASE WHEN day1_result.position < 101 THEN true ELSE false END
        END as day1_is_declined,
     CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN ABS(last_result.position - day7_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day7_result.position < 101 THEN 100 - day7_result.position ELSE  0 END
        END::FLOAT as day7_difference,
        CASE WHEN day7_result is null AND last_result.position <= 101 THEN true ELSE false END day7_result_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN last_result.position < day7_result.position ELSE true END
        ELSE
            false
        END as day7_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day7_result.position < 101 THEN last_result.position > day7_result.position ELSE false END
            ELSE
            CASE WHEN day7_result.position < 101 THEN true ELSE false END
        END as day7_is_declined,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN ABS(last_result.position - day30_result.position) ELSE 100 - last_result.position END
        ELSE
            CASE WHEN day30_result.position < 101 THEN 100 - day30_result.position ELSE  0 END
        END::FLOAT as day30_difference,
        CASE WHEN day30_result is null AND last_result.position <= 101 THEN true ELSE false END day30_result_dash,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN last_result.position < day30_result.position ELSE true END
        ELSE
            false
        END as day30_is_improved,
        CASE WHEN last_result.position < 101 THEN
            CASE WHEN day30_result.position < 101 THEN last_result.position > day30_result.position ELSE false END
            ELSE
            CASE WHEN day30_result.position < 101 THEN true ELSE false END
        END as day30_is_declined,
      CASE WHEN last_result.position < 101 AND day1_result.position IS NOT NULL THEN
          CASE WHEN day1_result.position = 101 THEN true ELSE false END
          ELSE
          CASE WHEN day7_result.position IS NOT NULL THEN
              CASE WHEN day7_result.position = 101 THEN true ELSE false END
              ELSE
              CASE WHEN day30_result.position IS NOT NULL THEN
                  CASE WHEN day30_result.position = 101 THEN true ELSE false END
                  ELSE
                  CASE WHEN first_result.position = 101 THEN true ELSE false END
                  END
              END
          END as position_green_check_mark,
        CASE WHEN best_keyword_positions.position = last_result.position AND best_keyword_positions.position < 101 AND last_result.position < 101 AND day1_result.position != 101 AND day1_result IS NOT NULL THEN true ELSE false  END as position_trophy,
        keywords.manual_update_available as update_allowed,
        CASE WHEN first_result is null THEN true ELSE false END as first_position_dash,
        CASE WHEN last_result is null THEN true ELSE false END  as position_dash,
        projects.url as project_domain
from keywords
${
  filter.tagIds?.length > 0
    ? 'left join keywords_tags_keywords_tags on keywords.id = keywords_tags_keywords_tags.keywords_id'
    : ''
}
left join last_keyword_positions on keywords.id = last_keyword_positions.keyword_id
left join keyword_positions_for_day as last_result on last_keyword_positions.keyword_id = last_result.keyword_id and last_result.update_date = last_keyword_positions.date
left join keyword_positions_for_day as day1_result on keywords.id = day1_result.keyword_id AND day1_result.update_date = last_result.update_date - INTERVAL '1 days'
left join keyword_positions_for_day as day7_result on keywords.id = day7_result.keyword_id AND day7_result.update_date = last_result.update_date - INTERVAL '7 days'
left join keyword_positions_for_day as day30_result on keywords.id = day30_result.keyword_id AND day30_result.update_date = last_result.update_date - INTERVAL '30 days'
left join first_keyword_positions on first_keyword_positions.keyword_id = keywords.id
left join keyword_positions_for_day as first_result on first_result.keyword_id = keywords.id AND first_result.update_date = first_keyword_positions.date
left join best_keyword_positions on keywords.id = best_keyword_positions.keyword_id
join desktop_types on keywords.device_type_id = desktop_types.id
join projects on keywords.project_id = projects.id
where keywords.project_id = $1 AND keywords.name ILIKE $2 ${
        filter.tagIds?.length > 0
          ? `and keywords_tags_keywords_tags.keywords_tags_id in (${filter.tagIds.map(
              (id) => id,
            )})`
          : ''
      } 
    ${
      deviceType != DeviceTypesEnum.DesktopAndMobile
        ? 'and desktop_types.name = $5'
        : ''
    } 
    ${filterQuery}
) as result ${filterByResult}
order by ${
        options.sortBy
          ? ['d1', 'd7', 'd30', 'life'].includes(options.sortBy)
            ? getKeyByValue(
                SortingByPeriodsEnum,
                `${options.sortBy}_${options.sortOrder.toLowerCase()}`,
              )
            : getKeyByValue(SortKeywordRankingsEnum, options.sortBy)
          : 'CASE WHEN day1_is_improved AND day1_position is not null THEN 0 ELSE 1 END ASC,\n' +
            'CASE WHEN day1_difference >= 0 AND day1_position is not null THEN -day1_difference END ASC,\n' +
            'CASE WHEN day7_is_improved AND day7_position is not null THEN 0 ELSE 1 END ASC,\n' +
            'CASE WHEN day7_difference >= 0 AND day7_position is not null THEN -day7_difference END ASC,\n' +
            'CASE WHEN day30_is_improved AND day30_position is not null THEN 0 ELSE 1 END ASC,\n' +
            'CASE WHEN day30_difference >= 0 AND day30_position is not null THEN -day30_difference END ASC,\n' +
            'CASE WHEN life_is_improved THEN 0 ELSE 1 END ASC,\n' +
            'CASE WHEN life_difference >= 0 THEN -life_difference END ASC ,\n' +
            'CASE WHEN position < 101 THEN position END ASC'
      } ${
        options.sortBy
          ? ['d1', 'd7', 'd30', 'life'].includes(options.sortBy)
            ? ''
            : options.sortOrder
          : ''
      }
offset $3 LIMIT $4`,
      deviceType !== DeviceTypesEnum.DesktopAndMobile
        ? [
            projectId,
            options.search ? `%${options.search}%` : '%%',
            (currentPage - 1) * itemsPerPage,
            itemsPerPage,
            deviceType,
          ]
        : [
            projectId,
            options.search ? `%${options.search}%` : '%%',
            (currentPage - 1) * itemsPerPage,
            itemsPerPage,
          ],
    );
    return {
      items: items,
      meta: {
        itemCount: items.length,
        totalItems: count,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
        currentPage,
      },
    };
  }
}
