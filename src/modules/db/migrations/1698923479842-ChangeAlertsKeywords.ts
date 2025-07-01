import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAlertsKeywords1698923479842 implements MigrationInterface {
  name = 'ChangeAlertsKeywords1698923479842';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "previous_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "initialization_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "previous_position_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "initialization_position_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_df2794aab26db29404eb544a672" FOREIGN KEY ("previous_position_id") REFERENCES "keywords_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_66e06d633fce767a74b437e300d" FOREIGN KEY ("initialization_position_id") REFERENCES "keywords_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_66e06d633fce767a74b437e300d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_df2794aab26db29404eb544a672"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "initialization_position_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "previous_position_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "initialization_position" numeric NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "previous_position" numeric NOT NULL`,
    );
  }
}
