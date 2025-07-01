import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateKeywordPositionsForDay1707645859322
  implements MigrationInterface
{
  name = 'CreateKeywordPositionsForDay1707645859322';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "keyword_positions_for_day" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "update_date" date NOT NULL, "position" double precision NOT NULL, "url" text NOT NULL, "previous_update_date" date, "previous_position" double precision, "keyword_id" bigint, CONSTRAINT "PK_dbd11277166b6b94cf87e3d88a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ALTER COLUMN "previous_position" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" ADD CONSTRAINT "FK_60e4c695f7800962e7cf8a839a4" FOREIGN KEY ("keyword_id") REFERENCES "keywords"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keyword_positions_for_day" DROP CONSTRAINT "FK_60e4c695f7800962e7cf8a839a4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "keywords_positions" ALTER COLUMN "previous_position" DROP NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "keyword_positions_for_day"`);
  }
}
