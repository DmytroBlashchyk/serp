import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleIdToUserTable1719470478198 implements MigrationInterface {
  name = 'AddGoogleIdToUserTable1719470478198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "google_id" numeric`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
  }
}
