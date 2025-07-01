import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPagesToBatches1693471232507 implements MigrationInterface {
  name = 'AddPagesToBatches1693471232507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "batches" RENAME COLUMN "keyword_count" TO "pages"`,
    );
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "pages"`);
    await queryRunner.query(`ALTER TABLE "batches" ADD "pages" jsonb`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" DROP COLUMN "pages"`);
    await queryRunner.query(
      `ALTER TABLE "batches" ADD "pages" numeric NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "batches" RENAME COLUMN "pages" TO "keyword_count"`,
    );
  }
}
