import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscribedColumnToTriggerRecipients1698917608072
  implements MigrationInterface
{
  name = 'AddSubscribedColumnToTriggerRecipients1698917608072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trigger_recipients" ADD "subscribed" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trigger_recipients" DROP COLUMN "subscribed"`,
    );
  }
}
