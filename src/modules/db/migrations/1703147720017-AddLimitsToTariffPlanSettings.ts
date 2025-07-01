import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLimitsToTariffPlanSettings1703147720017
  implements MigrationInterface
{
  name = 'AddLimitsToTariffPlanSettings1703147720017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "email_reports_limit" integer NOT NULL DEFAULT '20'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "alerts_limit" integer NOT NULL DEFAULT '20'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "users_limit" integer NOT NULL DEFAULT '100'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "notes_limit" integer NOT NULL DEFAULT '100'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "shared_links_limit" integer NOT NULL DEFAULT '500'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "shared_links_limit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "notes_limit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "users_limit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "alerts_limit"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "email_reports_limit"`,
    );
  }
}
