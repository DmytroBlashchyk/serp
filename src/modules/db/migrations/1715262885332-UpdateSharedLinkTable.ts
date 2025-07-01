import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSharedLinkTable1715262885332 implements MigrationInterface {
  name = 'UpdateSharedLinkTable1715262885332';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_links" DROP CONSTRAINT "FK_d24067378c8db02f50097fe5f6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_links" ADD CONSTRAINT "FK_d24067378c8db02f50097fe5f6f" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_links" DROP CONSTRAINT "FK_d24067378c8db02f50097fe5f6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_links" ADD CONSTRAINT "FK_d24067378c8db02f50097fe5f6f" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
