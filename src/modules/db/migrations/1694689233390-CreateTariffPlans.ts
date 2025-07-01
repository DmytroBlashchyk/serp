import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTariffPlans1694689233390 implements MigrationInterface {
  name = 'CreateTariffPlans1694689233390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tariff_plan_settings" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "daily_word_count" integer NOT NULL, "monthly_word_count" integer NOT NULL, "price" double precision NOT NULL, "paddle_product_id" text NOT NULL, "tariff_plan_id" bigint, CONSTRAINT "PK_03d11c541bd3f3a3358a80fc396" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tariff_plans" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_22bafd543fe26a5a7e3ca3900c8" UNIQUE ("name"), CONSTRAINT "PK_443dee971fd7845837139d972ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" ADD CONSTRAINT "FK_62221856b9c21fcde67c8fe9265" FOREIGN KEY ("tariff_plan_id") REFERENCES "tariff_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tariff_plan_settings" DROP CONSTRAINT "FK_62221856b9c21fcde67c8fe9265"`,
    );
    await queryRunner.query(`DROP TABLE "tariff_plans"`);
    await queryRunner.query(`DROP TABLE "tariff_plan_settings"`);
  }
}
