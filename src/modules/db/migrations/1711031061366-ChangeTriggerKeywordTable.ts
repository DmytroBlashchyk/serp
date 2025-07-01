import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeTriggerKeywordTable1711031061366
  implements MigrationInterface
{
  name = 'ChangeTriggerKeywordTable1711031061366';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP CONSTRAINT "FK_5021d6d2d877f82ec57c8a37b0f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" RENAME COLUMN "keyword_position_id" TO "trigger_initialization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP COLUMN "trigger_initialization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD "trigger_initialization" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" DROP COLUMN "trigger_initialization"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD "trigger_initialization" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" RENAME COLUMN "trigger_initialization" TO "keyword_position_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "triggers_keywords" ADD CONSTRAINT "FK_5021d6d2d877f82ec57c8a37b0f" FOREIGN KEY ("keyword_position_id") REFERENCES "keywords_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
