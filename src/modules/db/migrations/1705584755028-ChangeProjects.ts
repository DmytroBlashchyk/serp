import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProjects1705584755028 implements MigrationInterface {
  name = 'ChangeProjects1705584755028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE projects SET location = NULL WHERE location ILIKE '%%'`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" RENAME COLUMN "location" TO "location_id"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "location_id"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "location_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_75dc05c3a12d7d3a9628734075d" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_75dc05c3a12d7d3a9628734075d"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "location_id"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "location_id" text`);
    await queryRunner.query(
      `UPDATE projects SET location = NULL WHERE location_id ILIKE '%%'`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" RENAME COLUMN "location_id" TO "location"`,
    );
  }
}
