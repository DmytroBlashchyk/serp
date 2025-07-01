import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTransactionTable1715073475574 implements MigrationInterface {
  name = 'UpdateTransactionTable1715073475574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "amount" double precision NOT NULL DEFAULT '0'`,
    );

    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "tariff_plan_setting_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_d7138989f6e166d9572deedef56" FOREIGN KEY ("tariff_plan_setting_id") REFERENCES "tariff_plan_settings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_d7138989f6e166d9572deedef56"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "tariff_plan_setting_id"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "amount"`);
  }
}
