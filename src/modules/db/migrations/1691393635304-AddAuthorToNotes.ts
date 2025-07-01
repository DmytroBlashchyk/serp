import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthorToNotes1691393635304 implements MigrationInterface {
  name = 'AddAuthorToNotes1691393635304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notes" ADD "author_id" bigint`);
    await queryRunner.query(
      `ALTER TABLE "notes" ADD CONSTRAINT "FK_35b89a50cb9203dccff44136519" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notes" DROP CONSTRAINT "FK_35b89a50cb9203dccff44136519"`,
    );
    await queryRunner.query(`ALTER TABLE "notes" DROP COLUMN "author_id"`);
  }
}
