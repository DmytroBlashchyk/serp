import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { tariffPlans } from 'modules/db/seeds/data/1694684180893-AddTariffPlans/tariffPlans';

export class AddTariffPlans1694684180893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TariffPlanEntity, builder, tariffPlans);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TariffPlanEntity, builder, tariffPlans);
  }
}
