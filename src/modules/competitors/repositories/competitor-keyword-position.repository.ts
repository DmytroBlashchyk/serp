import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { CompetitorKeywordPositionEntity } from 'modules/competitors/entities/competitor-keyword-position.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { GetProjectPerformanceType } from 'modules/keywords/types/get-project-performance.type';

@Injectable()
@EntityRepository(CompetitorKeywordPositionEntity)
export class CompetitorKeywordPositionRepository extends BaseRepository<CompetitorKeywordPositionEntity> {
  /**
   * Retrieves the historical position data for a specific keyword and competitor
   * within a specified date range.
   *
   * @param {IdType} keywordId - The ID of the keyword to retrieve position history for.
   * @param {IdType} competitorId - The ID of the competitor whose position history should be retrieved.
   * @param {string} toDate - The end date of the range to retrieve data for (inclusive).
   * @param {string} fromDate - The start date of the range to retrieve data for (inclusive).
   * @return {Promise<{ date: string, position: number }[]>} - A promise that resolves to an array of objects, each containing the date and the corresponding position of the competitor for the specified keyword.
   */
  async getPositionHistory(
    keywordId: IdType,
    competitorId: IdType,
    toDate: string,
    fromDate: string,
  ): Promise<{ date: string; position: number }[]> {
    return this.query(
      `
SELECT
    TO_CHAR(subquery.date, 'YYYY-MM-DD') as date,
    competitors_keywords_positions.position
FROM
    competitors_keywords_positions
JOIN (
    SELECT
        DATE(created_at) AS date,
        MAX(created_at) AS max_time
    FROM
        competitors_keywords_positions
    WHERE
        keyword_id = $1 AND competitor_id = $2
        AND created_at >=$3 AND created_at <=$4
    GROUP BY
        DATE(created_at)
) AS subquery
ON
    DATE(competitors_keywords_positions.created_at) = subquery.date
    AND competitors_keywords_positions.created_at = subquery.max_time
WHERE
    keyword_id = $1 AND competitor_id = $2
    AND created_at >=$3 AND created_at <=$4
    `,
      [keywordId, competitorId, fromDate, toDate],
    );
  }

  /**
   * Deletes keyword positions associated with given keyword IDs.
   *
   * @param {IdType[]} ids - An array of keyword IDs whose positions are to be deleted.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async deleteKeywordPositionsByKeywordIds(ids: IdType[]): Promise<void> {
    await this.createQueryBuilder('competitors_keywords_positions')
      .where('competitors_keywords_positions.keyword_id In(:...ids)', { ids })
      .delete()
      .execute();
  }

  /**
   * Retrieves the performance of a project based on specified parameters.
   *
   * @param {IdType} projectId - The ID of the project to get performance for.
   * @param {IdType} competitorId - The ID of the competitor to compare performance against.
   * @param {string} fromDate - The start date for the performance period in 'YYYY-MM-DD' format.
   * @param {string} toDate - The end date for the performance period in 'YYYY-MM-DD' format.
   * @param {DeviceTypesEnum} deviceType - The type of device to filter results by.
   * @return {Promise<GetProjectPerformanceType[]>} A promise that resolves to an array of project performance metrics.
   */
  async getProjectPerformance(
    projectId: IdType,
    competitorId: IdType,
    fromDate: string,
    toDate: string,
    deviceType: DeviceTypesEnum,
  ): Promise<GetProjectPerformanceType[]> {
    return this.query(
      `
select
    TO_CHAR(date_trunc('day', competitors_keywords_positions.created_at), 'YYYY-MM-DD') as date,
    ROUND(COALESCE(AVG(competitors_keywords_positions.position)FILTER ( WHERE competitors_keywords_positions.position <= 101 )::numeric, 0), 2)::FLOAT as avg
from competitors_keywords_positions
join keywords on keywords.id = competitors_keywords_positions.keyword_id
${
  deviceType !== DeviceTypesEnum.DesktopAndMobile
    ? 'left join desktop_types on keywords.device_type_id = desktop_types.id'
    : ''
}
join projects on projects.id = keywords.project_id
where projects.id = $1 
    and competitors_keywords_positions.competitor_id = $2 
    and competitors_keywords_positions.created_at >= $3 
    and competitors_keywords_positions.created_at <= $4
    ${
      deviceType != DeviceTypesEnum.DesktopAndMobile
        ? `and desktop_types.name = $5`
        : ''
    }
group by 1 order by date ASC`,
      deviceType != DeviceTypesEnum.DesktopAndMobile
        ? [projectId, competitorId, fromDate, toDate, deviceType]
        : [projectId, competitorId, fromDate, toDate],
    );
  }

  /**
   * Deletes keyword positions by the specified competitor IDs.
   *
   * @param {IdType[]} ids - An array of competitor IDs whose keyword positions should be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteKeywordPositionsByCompetitorIds(ids: IdType[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    await this.createQueryBuilder('competitors_keywords_positions')
      .where('competitors_keywords_positions.competitor_id In(:...ids)', {
        ids,
      })
      .delete()
      .execute();
  }
}
