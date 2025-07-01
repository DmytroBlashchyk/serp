import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAlertKeywordTable1711109917523
  implements MigrationInterface
{
  name = 'ChangeAlertKeywordTable1711109917523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_66e06d633fce767a74b437e300d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_df2794aab26db29404eb544a672"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "previous_position_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "initialization_position_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "keyword_positions_for_day_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_423ccba3f14e07c4892e5ba048a" FOREIGN KEY ("keyword_positions_for_day_id") REFERENCES "keyword_positions_for_day"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP CONSTRAINT "FK_423ccba3f14e07c4892e5ba048a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" DROP COLUMN "keyword_positions_for_day_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "initialization_position_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD "previous_position_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_df2794aab26db29404eb544a672" FOREIGN KEY ("previous_position_id") REFERENCES "keywords_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts_keywords" ADD CONSTRAINT "FK_66e06d633fce767a74b437e300d" FOREIGN KEY ("initialization_position_id") REFERENCES "keywords_positions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
