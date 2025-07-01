import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAccountTable1714646410196 implements MigrationInterface {
  name = 'UpdateAccountTable1714646410196';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_7c7bc85becc85aec89c103784e6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD "subscription_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "UQ_ff7dd70f8e70aee20c82592d09a" UNIQUE ("subscription_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_ff7dd70f8e70aee20c82592d09a" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_ff7dd70f8e70aee20c82592d09a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "UQ_ff7dd70f8e70aee20c82592d09a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP COLUMN "subscription_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "account_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_7c7bc85becc85aec89c103784e6" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
