import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeReportRecipients1701602664490 implements MigrationInterface {
  name = 'ChangeReportRecipients1701602664490';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "report_recipients" DROP CONSTRAINT "FK_fe3fc34469ac7a68f3c7efc4234"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_recipients" ADD CONSTRAINT "FK_fe3fc34469ac7a68f3c7efc4234" FOREIGN KEY ("email_report_id") REFERENCES "email_reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "report_recipients" DROP CONSTRAINT "FK_fe3fc34469ac7a68f3c7efc4234"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_recipients" ADD CONSTRAINT "FK_fe3fc34469ac7a68f3c7efc4234" FOREIGN KEY ("email_report_id") REFERENCES "email_reports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
