import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLanguagesTable1727507702045 implements MigrationInterface {
  name = 'ChangeLanguagesTable1727507702045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "serp" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "keyword_data" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "serp_bing" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "keyword_data_bing" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" DROP COLUMN "keyword_data_bing"`,
    );
    await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "serp_bing"`);
    await queryRunner.query(
      `ALTER TABLE "languages" DROP COLUMN "keyword_data"`,
    );
    await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "serp"`);
  }
}
