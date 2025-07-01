import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentMethodsTable1716463410789
  implements MigrationInterface
{
  name = 'CreatePaymentMethodsTable1716463410789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "payment_methods" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_a793d7354d7c3aaf76347ee5a66" UNIQUE ("name"), CONSTRAINT "PK_34f9b8c6dfb4ac3559f7e2820d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "payment_method_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_edf01b20528c5479952731a114a" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_edf01b20528c5479952731a114a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "payment_method_id"`,
    );
    await queryRunner.query(`DROP TABLE "payment_methods"`);
  }
}
