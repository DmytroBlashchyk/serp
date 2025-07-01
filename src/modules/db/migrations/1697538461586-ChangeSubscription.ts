import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSubscription1697538461586 implements MigrationInterface {
  name = 'ChangeSubscription1697538461586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbf3c6f0623d668957812341259"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "tariff_plan_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "transaction_id" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "tariff_plan_setting_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "transaction_status_id" bigint`,
    );
    await queryRunner.query(`ALTER TABLE "subscriptions" ADD "card_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_e5db091c2b71c951683d8eef3b0" FOREIGN KEY ("tariff_plan_setting_id") REFERENCES "tariff_plan_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_ec134e03872b8a4f535f6405fdf" FOREIGN KEY ("transaction_status_id") REFERENCES "transaction_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_4c2da331dbccb5481b20ebf230b" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_4c2da331dbccb5481b20ebf230b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_ec134e03872b8a4f535f6405fdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_e5db091c2b71c951683d8eef3b0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "card_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "transaction_status_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "tariff_plan_setting_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "transaction_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "tariff_plan_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbf3c6f0623d668957812341259" FOREIGN KEY ("tariff_plan_id") REFERENCES "tariff_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
