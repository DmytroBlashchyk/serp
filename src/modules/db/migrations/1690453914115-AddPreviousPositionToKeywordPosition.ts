import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreviousPositionToKeywordPosition1690453914115
  implements MigrationInterface
{
  name = 'AddPreviousPositionToKeywordPosition1690453914115';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ADD "previous_position" numeric NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" DROP COLUMN "previous_position"`,
    );
  }
}
