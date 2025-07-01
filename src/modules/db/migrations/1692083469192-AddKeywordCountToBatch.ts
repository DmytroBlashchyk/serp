import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKeywordCountToBatch1692083469192 implements MigrationInterface {
  name = 'AddKeywordCountToBatch1692083469192';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" ADD "keyword_count" numeric NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" DROP COLUMN "keyword_count"`,
    );
  }
}
