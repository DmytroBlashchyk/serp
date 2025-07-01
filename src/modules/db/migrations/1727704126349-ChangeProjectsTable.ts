import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProjectsTable1727704126349 implements MigrationInterface {
  name = 'ChangeProjectsTable1727704126349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ALTER COLUMN "updated_at" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ALTER COLUMN "updated_at" SET NOT NULL`,
    );
  }
}
