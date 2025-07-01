import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPositionsColumnToAlerts1698666579256
  implements MigrationInterface
{
  name = 'AddPositionsColumnToAlerts1698666579256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "previous_position" numeric NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" ADD "initialization_position" numeric NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP COLUMN "initialization_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "alerts" DROP COLUMN "previous_position"`,
    );
  }
}
