import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLanguagesTable1727938152758 implements MigrationInterface {
  name = 'ChangeLanguagesTable1727938152758';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code")`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" DROP CONSTRAINT "UQ_9c0e155475f0aa782e4a6178969"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD CONSTRAINT "UQ_9c0e155475f0aa782e4a6178969" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "languages" DROP CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2"`,
    );
  }
}
