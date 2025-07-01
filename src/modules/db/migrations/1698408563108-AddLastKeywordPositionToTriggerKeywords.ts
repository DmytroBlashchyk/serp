import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastKeywordPositionToTriggerKeywords1698408563108
  implements MigrationInterface
{
  name = 'AddLastKeywordPositionToTriggerKeywords1698408563108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "alerts" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "trigger_id" bigint, "keyword_id" bigint, CONSTRAINT "PK_60f895662df096bfcdfab7f4b96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD "keyword_position_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD CONSTRAINT "FK_5021d6d2d877f82ec57c8a37b0f" FOREIGN KEY ("keyword_position_id") REFERENCES "keywords_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "FK_5c2ef396594812f93aa2f2da44d" FOREIGN KEY ("trigger_id") REFERENCES "triggers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD CONSTRAINT "FK_7b7be273b4de239f81f4da418a0" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "FK_7b7be273b4de239f81f4da418a0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP CONSTRAINT "FK_5c2ef396594812f93aa2f2da44d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP CONSTRAINT "FK_5021d6d2d877f82ec57c8a37b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP COLUMN "keyword_position_id"`,
    );
    await queryRunner.query(`DROP TABLE "alerts"`);
  }
}
