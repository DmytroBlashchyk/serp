import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPreferredTariffPlanToAccount1699882754933
  implements MigrationInterface
{
  name = 'AddPreferredTariffPlanToAccount1699882754933';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "preferred_tariff_plan_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_5b8fb87a259f4f352b2ed153ab6" FOREIGN KEY ("preferred_tariff_plan_id") REFERENCES "tariff_plan_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_5b8fb87a259f4f352b2ed153ab6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "preferred_tariff_plan_id"`,
    );
  }
}
