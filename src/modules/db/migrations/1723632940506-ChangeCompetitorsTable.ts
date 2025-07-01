import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeCompetitorsTable1723632940506 implements MigrationInterface {
  name = 'ChangeCompetitorsTable1723632940506';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "competitors" ADD "business_name" text`,
    );
    await queryRunner.query(`ALTER TABLE "competitors" ADD "url" text`);
    await queryRunner.query(
      `ALTER TABLE "competitors" ALTER COLUMN "domain_name" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "competitors" ALTER COLUMN "domain_name" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "competitors" DROP COLUMN "url"`);
    await queryRunner.query(
      `ALTER TABLE "competitors" DROP COLUMN "business_name"`,
    );
  }
}
