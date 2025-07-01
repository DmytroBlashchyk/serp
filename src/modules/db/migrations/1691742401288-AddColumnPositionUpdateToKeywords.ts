import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnPositionUpdateToKeywords1691742401288
  implements MigrationInterface
{
  name = 'AddColumnPositionUpdateToKeywords1691742401288';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "position_update" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP COLUMN "position_update"`,
    );
  }
}
