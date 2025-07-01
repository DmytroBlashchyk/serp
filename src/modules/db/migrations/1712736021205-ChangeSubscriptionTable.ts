import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSubscriptionTable1712736021205
  implements MigrationInterface
{
  name = 'ChangeSubscriptionTable1712736021205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "available_number_of_updates"`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" DROP COLUMN "number_of_daily_updates_available"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "number_of_daily_updates_available" numeric NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "subscriptions" ADD "available_number_of_updates" numeric NOT NULL DEFAULT '0'`,
    );
  }
}
