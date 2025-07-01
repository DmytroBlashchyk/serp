import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTariffPlanSettingTable1712233447712
  implements MigrationInterface
{
  name = 'ChangeTariffPlanSettingTable1712233447712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "daily_word_count"`,
    );

    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "monthly_word_count"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "monthly_word_count" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "daily_word_count" integer NOT NULL`,
    );
  }
}
