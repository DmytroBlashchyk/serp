import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteTransactionСolumn1714565193785
  implements MigrationInterface
{
  name = 'DeleteTransactionСolumn1714565193785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_ec134e03872b8a4f535f6405fdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "transaction_status_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "transaction_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "transaction_id" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "transaction_status_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_ec134e03872b8a4f535f6405fdf" FOREIGN KEY ("transaction_status_id") REFERENCES "transaction_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
