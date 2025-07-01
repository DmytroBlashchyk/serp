import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { limitTypes } from 'modules/db/seeds/data/1712224054352-CreateLimitsTable/limitTypes';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';

export class AddLimitTypes1712225184216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(LimitTypeEntity, builder, limitTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(LimitTypeEntity, builder, limitTypes);
  }
}
