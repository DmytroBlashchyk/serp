import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastUpdateDateToKeywords1705918451732
  implements MigrationInterface
{
  name = 'AddLastUpdateDateToKeywords1705918451732';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "last_update_date" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP COLUMN "last_update_date"`,
    );
  }
}
