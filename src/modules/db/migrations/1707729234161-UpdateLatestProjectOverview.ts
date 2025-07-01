import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLatestProjectOverview1707729234161
  implements MigrationInterface
{
  name = 'UpdateLatestProjectOverview1707729234161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" ADD "update_date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" ADD "previous_update_date" date NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" ADD "increasing_average_position" boolean NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" ADD "project_id" bigint`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" ADD CONSTRAINT "UQ_46f095fb2537470fd65f6df9f45" UNIQUE ("project_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" ADD CONSTRAINT "FK_46f095fb2537470fd65f6df9f45" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" DROP CONSTRAINT "FK_46f095fb2537470fd65f6df9f45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" DROP CONSTRAINT "UQ_46f095fb2537470fd65f6df9f45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" DROP COLUMN "project_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" DROP COLUMN "increasing_average_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" DROP COLUMN "previous_update_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "latest_project_overview" DROP COLUMN "update_date"`,
    );
  }
}
