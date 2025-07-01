import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLatestProjectDataMaterializedView1707467587454
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE MATERIALIZED VIEW latest_project_data AS

WITH latest_project_keyword_updates AS (
    SELECT
        keywords.project_id,
        DATE(kp_latest.created_at) AS update_date,
        COUNT(*) FILTER (WHERE kp_previous.position < kp_latest.position AND kp_latest.position < 101) AS declined,
        COUNT(*) FILTER (WHERE kp_previous.position > kp_latest.position OR (kp_latest.position IS NOT NULL AND kp_latest.position < 101 AND kp_previous.position IS NULL)) AS improved,
        COUNT(*) FILTER (WHERE kp_previous.position = kp_latest.position AND kp_latest.position IS NOT NULL) AS no_change,
        COUNT(*) FILTER (WHERE kp_previous.position != kp_latest.position AND kp_previous.position < 101 AND kp_latest.position = 101) AS lost
    FROM (
        SELECT
            keyword_id,
            created_at,
            keywords_positions.position,
            ROW_NUMBER() OVER (PARTITION BY keyword_id ORDER BY created_at DESC) AS rn
        FROM keywords_positions
    ) AS kp_latest
    JOIN keywords ON kp_latest.keyword_id = keywords.id
    LEFT JOIN LATERAL (
        SELECT * FROM keywords_positions AS kp_prev
        WHERE kp_prev.keyword_id = kp_latest.keyword_id
        AND DATE(kp_prev.created_at) < DATE(kp_latest.created_at)
        ORDER BY kp_prev.created_at DESC
        LIMIT 1
    ) AS kp_previous ON true
    WHERE kp_latest.rn = 1
    GROUP BY
        keywords.project_id, update_date
),
latest_and_previous_updates AS (
    SELECT
        project_id,
        MAX(CASE WHEN update_rank = 1 THEN update_date END) AS latest_update_date,
        MAX(CASE WHEN update_rank = 2 THEN update_date END) AS previous_update_date
    FROM (
        SELECT
            project_id,
            update_date,
            ROW_NUMBER() OVER (PARTITION BY project_id ORDER BY update_date DESC) AS update_rank
        FROM
            latest_project_keyword_updates
    ) AS ranked_updates
    GROUP BY
        project_id
)

SELECT
    result.*,
    COALESCE(latest_project_keyword_updates.declined, 0)::FLOAT AS declined,
    COALESCE(latest_project_keyword_updates.improved, 0)::FLOAT AS improved,
    COALESCE(latest_project_keyword_updates.no_change, 0)::FLOAT AS no_change,
    COALESCE(latest_project_keyword_updates.lost, 0)::FLOAT as lost
FROM (
    SELECT
        projects.id,
        COALESCE(COUNT(keywords.id), 0)::FLOAT AS count
    FROM
        projects
    LEFT JOIN
        accounts ON projects.account_id = accounts.id
    LEFT JOIN
        keywords ON projects.id = keywords.project_id
    GROUP BY
        projects.id
) AS result
LEFT JOIN
    latest_and_previous_updates ON result.id = latest_and_previous_updates.project_id
LEFT JOIN
    latest_project_keyword_updates ON result.id = latest_project_keyword_updates.project_id
    AND latest_project_keyword_updates.update_date = latest_and_previous_updates.latest_update_date
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW latest_project_data`);
  }
}
