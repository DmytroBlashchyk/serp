import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateKeywords1702293881266 implements MigrationInterface {
  name = 'UpdateKeywords1702293881266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "search_volume" numeric NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "cpc" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "competition_index" numeric NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP COLUMN "competition_index"`,
    );
    await queryRunner.query(`ALTER TABLE "keywords" DROP COLUMN "cpc"`);
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP COLUMN "search_volume"`,
    );
  }
}
