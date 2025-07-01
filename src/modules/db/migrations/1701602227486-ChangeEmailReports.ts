import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEmailReports1701602227486 implements MigrationInterface {
  name = 'ChangeEmailReports1701602227486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP CONSTRAINT "FK_c7541d642f8643a9dababa64a69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD CONSTRAINT "FK_c7541d642f8643a9dababa64a69" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP CONSTRAINT "FK_c7541d642f8643a9dababa64a69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD CONSTRAINT "FK_c7541d642f8643a9dababa64a69" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
