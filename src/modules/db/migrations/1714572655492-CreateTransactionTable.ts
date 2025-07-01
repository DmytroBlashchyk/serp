import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionTable1714572655492 implements MigrationInterface {
  name = 'CreateTransactionTable1714572655492';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_80ad48141be648db2d84ff32f79"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "card_id"`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "account_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "UQ_9162bf9ab4e31961a8f7932974c" UNIQUE ("transaction_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_49c0d6e8ba4bfb5582000d851f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "UQ_9162bf9ab4e31961a8f7932974c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "account_id"`,
    );
    await queryRunner.query(`ALTER TABLE "transactions" ADD "card_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_80ad48141be648db2d84ff32f79" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
