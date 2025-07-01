import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManualUpdateAvailableToKeywords1709879772203
  implements MigrationInterface
{
  name = 'AddManualUpdateAvailableToKeywords1709879772203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" ADD "manual_update_available" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "keywords" DROP COLUMN "manual_update_available"`,
    );
  }
}
