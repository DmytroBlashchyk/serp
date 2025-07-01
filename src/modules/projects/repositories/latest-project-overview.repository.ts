import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { LatestProjectOverviewEntity } from 'modules/projects/entities/latest-project-overview.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(LatestProjectOverviewEntity)
export class LatestProjectOverviewRepository extends BaseRepository<LatestProjectOverviewEntity> {
  /**
   * Inserts or updates the latest project overview for a given project.
   *
   * @param {IdType} projectId - The unique identifier for the project.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async insertOrUpdateLatestProjectOverview(projectId: IdType): Promise<void> {
    await this.query(
      `
INSERT INTO latest_project_overview (project_id, declined, improved, no_change, lost, 
                                    top3, top3_lost, top3_new, 
                                    top10, top10_lost, top10_new, 
                                    top30, top30_lost, top30_new, 
                                    top100, top100_lost, top100_new, 
                                    avg, avg_change, increasing_average_position,
                                    update_date, previous_update_date)
SELECT r.project_id, r.declined, r.improved, r.no_change, r.lost,
       r.top3, r.top3_lost, r.top3_new,
       r.top10, r.top10_lost, r.top10_new,
       r.top30, r.top30_lost, r.top30_new,
       r.top100, r.top100_lost, r.top100_new,
       r.avg_position, r.avg_change, r.increasing_average_position,
       r.update_date, r.previous_update_date
from (
SELECT *,
       ROUND(ABS(result.avg_position_for_previous_period - result.avg_position), 2) AS avg_change,
       CASE WHEN result.avg_position_for_previous_period - result.avg_position < 0 THEN true ELSE false END as increasing_average_position
from (SELECT
    keywords.project_id as project_id,
    keyword_positions_for_day.update_date,
    COALESCE(keyword_positions_for_day.previous_update_date, DATE(keyword_positions_for_day.update_date - INTERVAL '1 days')) as previous_update_date,
    COUNT(keywords.id) FILTER (
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
    COUNT(keywords.id) FILTER (WHERE keyword_positions_for_day.previous_position != keyword_positions_for_day.position AND keyword_positions_for_day.previous_position < 101 AND keyword_positions_for_day.position = 101)::FLOAT AS lost,
    COUNT(keyword_id) FILTER(
        WHERE keyword_positions_for_day.position < 4
    )::FLOAT as top3,
        COUNT(keyword_id) FILTER(
        WHERE keyword_positions_for_day.position < 11
    )::FLOAT as top10,
           COUNT(keyword_id) FILTER(
        WHERE keyword_positions_for_day.position < 31
    )::FLOAT as top30,
           COUNT(keyword_id) FILTER(
        WHERE keyword_positions_for_day.position < 101
    )::FLOAT as top100,
    COUNT(keywords.id) FILTER(
        WHERE (keyword_positions_for_day.previous_position < 4 AND keyword_positions_for_day.position > 3 )
                  OR
              (keyword_positions_for_day.previous_position < 4 AND keyword_positions_for_day.position is null)
    )::FLOAT as top3_lost,
        COUNT(keywords.id) FILTER(
        WHERE (keyword_positions_for_day.previous_position > 3
                   AND keyword_positions_for_day.previous_position < 101
                   AND keyword_positions_for_day.position < 4)
          OR (keyword_positions_for_day.previous_position is null
                    AND keyword_positions_for_day.position < 4)
    )::FLOAT as top3_new,
    COUNT(keywords.id) FILTER(
        WHERE (keyword_positions_for_day.previous_position < 11 AND keyword_positions_for_day.position > 10 )
                  OR
              (keyword_positions_for_day.previous_position < 11 AND keyword_positions_for_day.position is null)
    )::FLOAT as top10_lost,
            COUNT(keywords.id) FILTER(
        WHERE (
                keyword_positions_for_day.previous_position > 10
               AND keyword_positions_for_day.previous_position < 101
               AND keyword_positions_for_day.position < 11)
          OR keyword_positions_for_day.previous_position is null
                 AND keyword_positions_for_day.position < 11
    )::FLOAT as top10_new,
            COUNT(keywords.id) FILTER(
        WHERE
                keyword_positions_for_day.previous_position > 30
                AND keyword_positions_for_day.previous_position < 101
                AND keyword_positions_for_day.position < 31
            OR (keyword_positions_for_day.previous_position is null AND keyword_positions_for_day.position < 31)
    )::FLOAT as top30_new,
              COUNT(keywords.id) FILTER(
        WHERE (keyword_positions_for_day.previous_position < 31 AND keyword_positions_for_day.position > 30 )
                  OR
              (keyword_positions_for_day.previous_position < 31 AND keyword_positions_for_day.position is null)
    )::FLOAT as top30_lost,
    COUNT(keywords.id) FILTER(
        WHERE (keyword_positions_for_day.previous_position < 101 AND keyword_positions_for_day.position > 100 )
                  OR
              (keyword_positions_for_day.previous_position < 101 AND keyword_positions_for_day.position is null)
    )::FLOAT as top100_lost,
            COUNT(keywords.id) FILTER(
        WHERE (keyword_positions_for_day.previous_position > 100 AND keyword_positions_for_day.position < 101)
          OR (keyword_positions_for_day.previous_position is null AND keyword_positions_for_day.position < 101)
    )::FLOAT as top100_new,
    COALESCE(AVG(keyword_positions_for_day.position)FILTER ( WHERE keyword_positions_for_day.position < 101 )::numeric, 0) as avg_position,
    COALESCE(AVG(keyword_positions_for_day.previous_position) FILTER ( WHERE keyword_positions_for_day.previous_position is not null AND keyword_positions_for_day.previous_position < 101)::numeric, 0) as avg_position_for_previous_period
FROM
    keyword_positions_for_day
left join keywords on keyword_positions_for_day.keyword_id = keywords.id
WHERE
    keywords.project_id = $1 AND
    keyword_positions_for_day.update_date = (
        SELECT
            MAX(keyword_positions_for_day.update_date)
        FROM
            keyword_positions_for_day
        LEFT JOIN
            keywords ON keyword_positions_for_day.keyword_id = keywords.id
        WHERE
            keywords.project_id = $1
    ) AND keyword_positions_for_day.previous_update_date = (
        SELECT
            MAX(keyword_positions_for_day.previous_update_date)
        FROM
            keyword_positions_for_day
        LEFT JOIN
            keywords ON keyword_positions_for_day.keyword_id = keywords.id
        WHERE
            keywords.project_id = $1)
GROUP BY keyword_positions_for_day.update_date,
         keyword_positions_for_day.previous_update_date,
         keywords.project_id) as result) as r
ON CONFLICT (project_id) DO UPDATE
SET
    declined = EXCLUDED.declined,
    improved = EXCLUDED.improved,
    no_change = EXCLUDED.no_change,
    lost = EXCLUDED.lost,
    top3 = EXCLUDED.top3,
    top3_lost = EXCLUDED.top3_lost,
    top3_new = EXCLUDED.top3_new,
    top10 = EXCLUDED.top10,
    top10_lost = EXCLUDED.top10_lost,
    top10_new = EXCLUDED.top10_new,
    top30 = EXCLUDED.top30,
    top30_lost = EXCLUDED.top30_lost,
    top30_new = EXCLUDED.top30_new,
    top100 = EXCLUDED.top100,
    top100_lost = EXCLUDED.top100_lost,
    top100_new = EXCLUDED.top100_new,
    avg = EXCLUDED.avg,
    avg_change = EXCLUDED.avg_change,
    update_date = EXCLUDED.update_date,
    previous_update_date = EXCLUDED.previous_update_date,
    increasing_average_position = EXCLUDED.increasing_average_position
    `,
      [projectId],
    );
  }

  /**
   * Retrieves the most recent update dates of a given project by its ID.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<LatestProjectOverviewEntity>} A promise that resolves to the latest project overview entity.
   */
  async getCurrentDatesOfLastProjectUpdate(
    projectId: IdType,
  ): Promise<LatestProjectOverviewEntity> {
    return this.createQueryBuilder('latest_project_overview')
      .leftJoin('latest_project_overview.project', 'project')
      .where('project.id =:projectId', { projectId })
      .getOne();
  }
}
