import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTimezoneTable1696406102772 implements MigrationInterface {
  name = 'UpdateTimezoneTable1696406102772';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "timezones" ADD "tz_code" text`);
    await queryRunner.query(`ALTER TABLE "timezones" ADD "utc" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "timezones" DROP COLUMN "utc"`);
    await queryRunner.query(`ALTER TABLE "timezones" DROP COLUMN "tz_code"`);
  }
}
