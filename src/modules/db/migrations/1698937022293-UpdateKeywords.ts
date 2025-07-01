import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateKeywords1698937022293 implements MigrationInterface {
  name = 'UpdateKeywords1698937022293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP CONSTRAINT "FK_5e396c2fd75ba89ac3d32e08292"`,
    );
    await queryRunner.query(`ALTER TABLE "keywords" DROP COLUMN "batch_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "keywords" ADD "batch_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD CONSTRAINT "FK_5e396c2fd75ba89ac3d32e08292" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
