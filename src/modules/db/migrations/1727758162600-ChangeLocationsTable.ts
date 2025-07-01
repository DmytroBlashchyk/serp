import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLocationsTable1727758162600 implements MigrationInterface {
  name = 'ChangeLocationsTable1727758162600';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "serp" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "keyword_data" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "serp_bing" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "keyword_data_bing" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "serp_you_tube" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "serp_yahoo" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" ADD "serp_baidu" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "serp_baidu"`);
    await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "serp_yahoo"`);
    await queryRunner.query(
      `ALTER TABLE "locations" DROP COLUMN "serp_you_tube"`,
    );
    await queryRunner.query(
      `ALTER TABLE "locations" DROP COLUMN "keyword_data_bing"`,
    );
    await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "serp_bing"`);
    await queryRunner.query(
      `ALTER TABLE "locations" DROP COLUMN "keyword_data"`,
    );
    await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "serp"`);
  }
}
