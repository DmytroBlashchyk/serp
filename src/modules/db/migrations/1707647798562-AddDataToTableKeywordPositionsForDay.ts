import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataToTableKeywordPositionsForDay1707647798562
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
INSERT INTO keyword_positions_for_day (keyword_id, update_date, position, url, previous_update_date, previous_position)
WITH RankedPositions AS (
    SELECT
        keyword_id,
        DATE(created_at) AS date,
        position,
        url,
        ROW_NUMBER() OVER (PARTITION BY keyword_id, DATE(created_at) ORDER BY created_at DESC) AS rank,
        LAG(position) OVER (PARTITION BY keyword_id ORDER BY created_at) AS previous_position,
        LAG(url) OVER (PARTITION BY keyword_id ORDER BY created_at) AS previous_url,
        COALESCE(LAG(DATE(created_at)) OVER (PARTITION BY keyword_id ORDER BY created_at), DATE(created_at) - INTERVAL '1 day') AS previous_date
    FROM keywords_positions
)
SELECT keyword_id, date as update_date, position, url, DATE(previous_date) AS previous_update_date, previous_position AS previous_position
FROM RankedPositions
WHERE rank = 1;
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    delete from keyword_positions_for_day where id > 0`);
  }
}
