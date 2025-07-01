import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToKeywordPositionForDay1707650338097
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToKeywordPositionForDay1707650338097';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" ADD CONSTRAINT "UQ_84ba4bf9e995227b30d1d05c333" UNIQUE ("keyword_id", "update_date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" DROP CONSTRAINT "UQ_84ba4bf9e995227b30d1d05c333"`,
    );
  }
}
