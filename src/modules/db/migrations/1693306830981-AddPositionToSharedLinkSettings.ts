import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPositionToSharedLinkSettings1693306830981
  implements MigrationInterface
{
  name = 'AddPositionToSharedLinkSettings1693306830981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "position" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "position"`,
    );
  }
}
