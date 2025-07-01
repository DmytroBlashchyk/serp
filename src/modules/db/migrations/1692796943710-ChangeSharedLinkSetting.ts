import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSharedLinkSetting1692796943710
  implements MigrationInterface
{
  name = 'ChangeSharedLinkSetting1692796943710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "c_pc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "local_search_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "global_search_volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "date_added"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "volume" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "url" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "updated" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "updated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" DROP COLUMN "volume"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "date_added" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "global_search_volume" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "local_search_volume" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "shared_link_settings" ADD "c_pc" boolean NOT NULL DEFAULT true`,
    );
  }
}
