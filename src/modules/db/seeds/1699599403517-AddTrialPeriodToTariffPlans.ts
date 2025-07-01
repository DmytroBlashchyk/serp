import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { trialPeriod } from 'modules/db/seeds/data/1699599403517-AddTrialPeriodToTariffPlans/trial-plan';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';

export class AddTrialPeriodToTariffPlans1699599403517
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TariffPlanEntity, builder, [trialPeriod]);
    const item = await queryRunner.manager.findOne(TariffPlanEntity, {
      where: { name: 'Trial Period' },
    });
    const { name, ...settings } = trialPeriod;
    await builder
      .insert()
      .into(TariffPlanSettingEntity)
      .values([{ tariffPlan: { id: item.id }, ...settings, type: { id: 1 } }])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TariffPlanEntity, builder, [trialPeriod]);
  }
}
