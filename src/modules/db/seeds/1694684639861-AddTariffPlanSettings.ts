import { MigrationInterface, QueryRunner } from 'typeorm';
import { tariffPlans } from 'modules/db/seeds/data/1694684180893-AddTariffPlans/tariffPlans';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';

export class AddTariffPlanSettings1694684639861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    const data = [];
    for (const item of tariffPlans) {
      const { name, ...settings } = item;
      data.push({
        tariffPlan: { id: item.tariffPlanId },
        ...settings,
      });
    }
    await builder.insert().into(TariffPlanSettingEntity).values(data).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
