import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEmailReports1703163912495 implements MigrationInterface {
  name = 'UpdateEmailReports1703163912495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD "last_sent" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD "next_delivery" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP COLUMN "next_delivery"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP COLUMN "last_sent"`,
    );
  }
}
