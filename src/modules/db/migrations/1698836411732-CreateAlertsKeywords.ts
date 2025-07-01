import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertsKeywords1698836411732 implements MigrationInterface {
  name = 'CreateAlertsKeywords1698836411732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "FK_7b7be273b4de239f81f4da418a0"`,
    );
    await queryRunner.query(
      `CREATE TABLE "alerts_keywords" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "previous_position" numeric NOT NULL, "initialization_position" numeric NOT NULL, "alert_id" bigint, "keyword_id" bigint, CONSTRAINT "PK_9044d05ce343cf791f757a2764e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "alerts" DROP COLUMN "keyword_id"`);
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP COLUMN "previous_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP COLUMN "initialization_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_98d29d9bebb20843df8a0251baa" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_177af3c0195c62f451f6c33ae82" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_177af3c0195c62f451f6c33ae82"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_98d29d9bebb20843df8a0251baa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "initialization_position" numeric NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "previous_position" numeric NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "alerts" ADD "keyword_id" bigint`);
    await queryRunner.query(`DROP TABLE "alerts_keywords"`);
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "FK_7b7be273b4de239f81f4da418a0" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
