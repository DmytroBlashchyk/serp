import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFolderTable1715262167505 implements MigrationInterface {
  name = 'UpdateFolderTable1715262167505';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "folders" DROP CONSTRAINT "FK_ca762063ccc56e72d1cb71642a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" ADD CONSTRAINT "FK_ca762063ccc56e72d1cb71642a2" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "folders" DROP CONSTRAINT "FK_ca762063ccc56e72d1cb71642a2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "folders" ADD CONSTRAINT "FK_ca762063ccc56e72d1cb71642a2" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
