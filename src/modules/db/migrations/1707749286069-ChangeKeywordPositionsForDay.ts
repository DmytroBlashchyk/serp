import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeKeywordPositionsForDay1707749286069
  implements MigrationInterface
{
  name = 'ChangeKeywordPositionsForDay1707749286069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "update keyword_positions_for_day set previous_update_date = DATE(update_date - INTERVAL '1 days') where previous_update_date is null",
    );
    await queryRunner.query(
      'update keyword_positions_for_day set previous_position = 101 where previous_position is null',
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" ALTER COLUMN "previous_update_date" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" ALTER COLUMN "previous_position" SET DEFAULT '101'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" ALTER COLUMN "previous_position" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" ALTER COLUMN "previous_update_date" DROP NOT NULL`,
    );
  }
}
