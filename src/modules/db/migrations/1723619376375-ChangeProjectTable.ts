import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeProjectTable1723619376375 implements MigrationInterface {
  name = 'ChangeProjectTable1723619376375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" DROP CONSTRAINT "FK_445fce9883e0e1e94d671360fcf"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "country_id"`);
    await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "favicon"`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "business_name" text`);
    await queryRunner.query(
      `ALTER TABLE "projects" ALTER COLUMN "url" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "projects" ALTER COLUMN "url" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "projects" DROP COLUMN "business_name"`,
    );
    await queryRunner.query(`ALTER TABLE "projects" ADD "favicon" text`);
    await queryRunner.query(`ALTER TABLE "projects" ADD "country_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "projects" ADD CONSTRAINT "FK_445fce9883e0e1e94d671360fcf" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
