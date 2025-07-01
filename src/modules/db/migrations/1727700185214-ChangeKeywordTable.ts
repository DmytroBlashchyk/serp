import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeKeywordTable1727700185214 implements MigrationInterface {
  name = 'ChangeKeywordTable1727700185214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
  }
}
