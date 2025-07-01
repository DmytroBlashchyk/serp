import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUniqueLanguagesTable1727939117907
  implements MigrationInterface
{
  name = 'ChangeUniqueLanguagesTable1727939117907';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" DROP CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "languages" ADD CONSTRAINT "UQ_7397752718d1c9eb873722ec9b2" UNIQUE ("code")`,
    );
  }
}
