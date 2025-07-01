import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLimitsTable1712226716162 implements MigrationInterface {
  name = 'CreateLimitsTable1712226716162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "limit_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_8b9c9cae14936053694bdbdd042" UNIQUE ("name"), CONSTRAINT "PK_3cd7fef3ac4977aa217c48d7e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "account_limits" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "limit" numeric NOT NULL DEFAULT '0', "account_id" bigint, "account_limit_type_id" bigint, CONSTRAINT "PK_5c570146f4736a92fd7942bc7df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "default_tariff_plan_limits" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "limit" numeric NOT NULL DEFAULT '0', "tariff_plan_id" bigint, "limit_type_id" bigint, CONSTRAINT "PK_6b26fb3db0b05810045871e1470" PRIMARY KEY ("id"))`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "account_limits" ADD CONSTRAINT "FK_bb3dbf2e5793e0570d94fb911bd" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_limits" ADD CONSTRAINT "FK_c77fd755adb9761c6bcd5e185f5" FOREIGN KEY ("account_limit_type_id") REFERENCES "limit_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_tariff_plan_limits" ADD CONSTRAINT "FK_fa17685b74023f4c7a91a0a4a88" FOREIGN KEY ("tariff_plan_id") REFERENCES "tariff_plans"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_tariff_plan_limits" ADD CONSTRAINT "FK_10622305b8e022a0e7799d38646" FOREIGN KEY ("limit_type_id") REFERENCES "limit_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "default_tariff_plan_limits" DROP CONSTRAINT "FK_10622305b8e022a0e7799d38646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "default_tariff_plan_limits" DROP CONSTRAINT "FK_fa17685b74023f4c7a91a0a4a88"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_limits" DROP CONSTRAINT "FK_c77fd755adb9761c6bcd5e185f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_limits" DROP CONSTRAINT "FK_bb3dbf2e5793e0570d94fb911bd"`,
    );
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
    await queryRunner.query(`DROP TABLE "default_tariff_plan_limits"`);
    await queryRunner.query(`DROP TABLE "account_limits"`);
    await queryRunner.query(`DROP TABLE "limit_types"`);
  }
}
