import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLanguagesTable1727754372988 implements MigrationInterface {
  name = 'ChangeLanguagesTable1727754372988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "serp_you_tube" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" ADD "serp_yahoo" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" DROP CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code")`,
    );
    await queryRunner.query(`ALTER TABLE "languages" DROP COLUMN "serp_yahoo"`);
    await queryRunner.query(
      `ALTER TABLE "languages" DROP COLUMN "serp_you_tube"`,
    );
  }
}
