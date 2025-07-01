import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUrlToKeywordPosition1691155595491
  implements MigrationInterface
{
  name = 'AddUrlToKeywordPosition1691155595491';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ADD "url" text NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" DROP COLUMN "url"`,
    );
  }
}
