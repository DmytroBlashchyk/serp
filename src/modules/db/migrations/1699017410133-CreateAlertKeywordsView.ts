import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAlertKeywordsView1699017410133
  implements MigrationInterface
{
  name = 'CreateAlertKeywordsView1699017410133';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alert_keywords_view" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "alert_keyword_id" bigint, "user_id" bigint, CONSTRAINT "PK_58de6088c4eab8358252de53f00" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "alert_keywords_view" ADD CONSTRAINT "FK_dd0cedeae568982b64aedb424c6" FOREIGN KEY ("alert_keyword_id") REFERENCES "alerts_keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_keywords_view" ADD CONSTRAINT "FK_813b4cc73e90eba89795aec01d9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alert_keywords_view" DROP CONSTRAINT "FK_813b4cc73e90eba89795aec01d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alert_keywords_view" DROP CONSTRAINT "FK_dd0cedeae568982b64aedb424c6"`,
    );
    await queryRunner.query(`DROP TABLE "alert_keywords_view"`);
  }
}
