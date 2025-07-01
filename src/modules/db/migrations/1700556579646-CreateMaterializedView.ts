import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMaterializedView1700556579646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW daily_keyword_summary_materialized_view AS
WITH daily_keyword_positions AS (
    SELECT
        DATE(keywords_positions.created_at) AS date,
        keywords_positions.keyword_id,
        MAX(keywords_positions.position) AS max_position,
        keywords_positions.url AS url
    FROM
        keywords_positions
    GROUP BY
        keywords_positions.keyword_id, date, keywords_positions.url
)
SELECT
    keywords.id AS keyword_id,
    COALESCE(result_position.max_position, 0)::FLOAT AS position,
    result_position.url AS url,
    COALESCE(result_day1.max_position, 0)::FLOAT AS day1,
    COALESCE(result_day7.max_position, 0)::FLOAT AS day7,
    COALESCE(result_day30.max_position, 0)::FLOAT AS day30,
    COALESCE(MIN(CASE WHEN keywords_positions.position > 0 THEN keywords_positions.position END), 0)::FLOAT AS best,
    COUNT(keywords_positions.id) AS count,
    COALESCE(EXTRACT(DAY FROM MAX(keywords_positions.created_at) - MIN(keywords_positions.created_at)), 0) AS life,
    COALESCE(result_first_position.max_position, 0)::FLOAT AS first_position
FROM
    keywords
LEFT JOIN
    keywords_positions ON keywords.id = keywords_positions.keyword_id
LEFT JOIN (
    SELECT * FROM daily_keyword_positions
) AS result_position ON keywords.id = result_position.keyword_id AND CURRENT_DATE = result_position.date
LEFT JOIN (
    SELECT * FROM daily_keyword_positions
) AS result_day1 ON keywords.id = result_day1.keyword_id AND result_day1.date = CURRENT_DATE - INTERVAL '1 days'
LEFT JOIN (
    SELECT * FROM daily_keyword_positions
) AS result_day7 ON keywords.id = result_day7.keyword_id AND result_day7.date = CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN (
    SELECT * FROM daily_keyword_positions
) AS result_day30 ON keywords.id = result_day30.keyword_id AND result_day30.date = CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN (
    SELECT keyword_id, DATE(MIN(created_at)) AS date FROM keywords_positions GROUP BY keyword_id
) AS result_first ON keywords.id = result_first.keyword_id
LEFT JOIN (
    SELECT * FROM daily_keyword_positions
) AS result_first_position ON result_first.keyword_id = result_first_position.keyword_id AND result_first.date = result_first_position.date
GROUP BY
    keywords.id,
    result_position.max_position,
    result_position.url,
    result_day1.max_position,
    result_day7.max_position,
    result_day30.max_position,
    result_first_position.max_position;
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP MATERIALIZED VIEW daily_keyword_summary_materialized_view',
    );
  }
}
