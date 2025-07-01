import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { sharedLinkTypes } from 'modules/db/seeds/data/1691590109569-SharedLinkTypes/sharedLinkTypes';
import { SharedLinkTypeEntity } from 'modules/shared-links/entities/shared-link-type.entity';

export class SharedLinkTypes1691590109569 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(SharedLinkTypeEntity, builder, sharedLinkTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(SharedLinkTypeEntity, builder, sharedLinkTypes);
  }
}
