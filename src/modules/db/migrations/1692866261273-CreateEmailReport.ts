import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEmailReport1692866261273 implements MigrationInterface {
  name = 'CreateEmailReport1692866261273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_report_frequency" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_8c5d0180de30243b11235be7a6c" UNIQUE ("name"), CONSTRAINT "PK_9b2b584892d96ea03643f9a4ecd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "report_types" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_4700b6422dbc0efa20dd03406cf" UNIQUE ("name"), CONSTRAINT "PK_cf77ff01fa1da1f9978995e67c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "report_recipients" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" text NOT NULL, "email_report_id" bigint, CONSTRAINT "PK_991724ba960c0f45cbc933cf080" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "report_delivery_time" ("id" BIGSERIAL NOT NULL, "name" text NOT NULL, CONSTRAINT "UQ_235ab408114431bdfbf26a14323" UNIQUE ("name"), CONSTRAINT "PK_7b3e5c0c75115ebaf92ba44677f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "email_reports" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "type_id" bigint, "project_id" bigint, "frequency_id" bigint, "delivery_time_id" bigint, CONSTRAINT "PK_f4c976aafd98dc8312462b2cd9c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_recipients" ADD CONSTRAINT "FK_fe3fc34469ac7a68f3c7efc4234" FOREIGN KEY ("email_report_id") REFERENCES "email_reports"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD CONSTRAINT "FK_00a97eec2253deb899ee2b25498" FOREIGN KEY ("type_id") REFERENCES "report_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD CONSTRAINT "FK_c7541d642f8643a9dababa64a69" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD CONSTRAINT "FK_aae4b826d3fc844939bf0655cbe" FOREIGN KEY ("frequency_id") REFERENCES "email_report_frequency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" ADD CONSTRAINT "FK_51f9facc5dad0fffb7eb0895d60" FOREIGN KEY ("delivery_time_id") REFERENCES "report_delivery_time"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP CONSTRAINT "FK_51f9facc5dad0fffb7eb0895d60"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP CONSTRAINT "FK_aae4b826d3fc844939bf0655cbe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP CONSTRAINT "FK_c7541d642f8643a9dababa64a69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "email_reports" DROP CONSTRAINT "FK_00a97eec2253deb899ee2b25498"`,
    );
    await queryRunner.query(
      `ALTER TABLE "report_recipients" DROP CONSTRAINT "FK_fe3fc34469ac7a68f3c7efc4234"`,
    );
    await queryRunner.query(`DROP TABLE "email_reports"`);
    await queryRunner.query(`DROP TABLE "report_delivery_time"`);
    await queryRunner.query(`DROP TABLE "report_recipients"`);
    await queryRunner.query(`DROP TABLE "report_types"`);
    await queryRunner.query(`DROP TABLE "email_report_frequency"`);
  }
}
