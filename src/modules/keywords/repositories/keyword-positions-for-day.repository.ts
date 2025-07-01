import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { KeywordPositionsForDayEntity } from 'modules/keywords/entities/keyword-positions-for-day.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordPositionsInfoRequest } from 'modules/keywords/requests/keyword-positions-info.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortKeywordPositionsEnum } from 'modules/keywords/enums/sort-keyword-positions.enum';

@Injectable()
@EntityRepository(KeywordPositionsForDayEntity)
export class KeywordPositionsForDayRepository extends BaseRepository<KeywordPositionsForDayEntity> {
  /**
   * Fetches paginated positions of a given keyword associated with an account.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} keywordId - The ID of the keyword.
   * @param {KeywordPositionsInfoRequest} options - The pagination and sorting options.
   * @return {Promise<Pagination<KeywordPositionsForDayEntity>>} The paginated keyword positions.
   */
  async getPaginatedKeywordPositions(
    accountId: IdType,
    keywordId: IdType,
    options: KeywordPositionsInfoRequest,
  ): Promise<Pagination<KeywordPositionsForDayEntity>> {
    const queryBuilder = this.createQueryBuilder('keyword_positions_for_day')
      .leftJoinAndSelect('keyword_positions_for_day.keyword', 'keyword')
      .leftJoinAndSelect('keyword.project', 'project')
      .leftJoinAndSelect('project.searchEngine', 'searchEngine')
      .where(
        'keyword_positions_for_day.keyword_id =:keywordId and project.account_id =:accountId',
        { keywordId, accountId },
      );

    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortKeywordPositionsEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('keyword_positions_for_day.updateDate', 'DESC');
    }

    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }

  /**
   * Retrieves the position history for a given keyword within a specified date range.
   *
   * @param {IdType} keywordId - The ID of the keyword for which to fetch the position history.
   * @param {string} fromDate - The start date for the date range filter in YYYY-MM-DD format.
   * @param {string} toDate - The end date for the date range filter in YYYY-MM-DD format.
   * @return {Promise<KeywordPositionsForDayEntity[]>} A promise that resolves to an array of KeywordPositionsForDayEntity objects representing the position history.
   */
  async getPositionHistory(
    keywordId: IdType,
    fromDate: string,
    toDate: string,
  ): Promise<KeywordPositionsForDayEntity[]> {
    return this.createQueryBuilder('keyword_positions_for_day')
      .where('keyword_positions_for_day.keyword_id =:keywordId', { keywordId })
      .andWhere('keyword_positions_for_day.updateDate >=:fromDate', {
        fromDate,
      })
      .andWhere('keyword_positions_for_day.updateDate <=:toDate', { toDate })
      .orderBy('keyword_positions_for_day.updateDate', 'ASC')
      .getMany();
  }

  /**
   * Adds or updates the last known position of a keyword for a specific day.
   * If a record for the given keyword and date exists, it updates the position and URL.
   * Otherwise, it inserts a new record with the provided details.
   *
   * @param {IdType} keywordId - The unique identifier of the keyword.
   * @param {number} position - The position of the keyword.
   * @param {string} url - The URL associated with the keyword.
   * @param {Date} date - The date for which the position is recorded.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async addOrUpdateLastKeywordPositionForDay(
    keywordId: IdType,
    position: number,
    url: string,
    date: Date,
  ): Promise<void> {
    await this.query(
      `
WITH new_data AS (
    SELECT
        keyword_id,
        date::date AS update_date,
        position,
        url
    FROM (VALUES
        ($1::bigint, $2::timestamp, $3::FLOAT, $4)
    ) AS data(keyword_id, date, position, url)
),
previous_data AS (
    SELECT
        keyword_id,
        update_date,
        position AS previous_position,
        url AS previous_url,
        LAG(update_date) OVER (PARTITION BY keyword_id ORDER BY update_date) AS previous_update_date
    FROM keyword_positions_for_day
)
INSERT INTO keyword_positions_for_day (keyword_id, update_date, position, url, previous_update_date, previous_position)
SELECT
    nd.keyword_id,
    nd.update_date,
    nd.position,
    nd.url,
    COALESCE(COALESCE(pd.previous_update_date, (SELECT MAX(update_date) FROM keyword_positions_for_day WHERE keyword_id = nd.keyword_id AND update_date < nd.update_date)), DATE(nd.update_date - INTERVAL '1 days')) as previous_update_date,
    COALESCE((SELECT position FROM keyword_positions_for_day WHERE keyword_id = nd.keyword_id AND update_date = COALESCE(pd.previous_update_date, (SELECT MAX(update_date) FROM keyword_positions_for_day WHERE keyword_id = nd.keyword_id AND update_date < nd.update_date))), 101) as previous_position 
FROM
    new_data nd
LEFT JOIN
    previous_data pd ON nd.keyword_id = pd.keyword_id AND nd.update_date = pd.update_date
ON CONFLICT (keyword_id, update_date) DO UPDATE
SET
    position = EXCLUDED.position,
    url = EXCLUDED.url

    `,
      [keywordId, date, position, url],
    );
  }
}
