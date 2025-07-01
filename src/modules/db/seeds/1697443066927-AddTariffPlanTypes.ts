import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { tariffPlanTypes } from 'modules/db/seeds/data/1697443066927-AddTariffPlanTypes/tariffPlanTypes';
import { TariffPlanTypeEntity } from 'modules/subscriptions/entities/tariff-plan-type.entity';

export class AddTariffPlanTypes1697443066927 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TariffPlanTypeEntity, builder, tariffPlanTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TariffPlanTypeEntity, builder, tariffPlanTypes);
  }
}
