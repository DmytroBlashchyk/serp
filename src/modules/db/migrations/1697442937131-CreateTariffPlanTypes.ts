import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTariffPlanTypes1697442937131 implements MigrationInterface {
  name = 'CreateTariffPlanTypes1697442937131';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tariff_plan_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_f919407838d6b84d39560438eef" UNIQUE ("name"), CONSTRAINT "PK_846c345418bb0ed79d2edfb7187" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD "type_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD CONSTRAINT "FK_4d51584f1df646a52b657c4ab91" FOREIGN KEY ("type_id") REFERENCES "tariff_plan_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP CONSTRAINT "FK_4d51584f1df646a52b657c4ab91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP COLUMN "type_id"`,
    );
    await queryRunner.query(`DROP TABLE "tariff_plan_types"`);
  }
}
