import { MigrationInterface, QueryRunner } from 'typeorm';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { annualTariffPlans } from 'modules/db/seeds/data/1697443066927-AddTariffPlanTypes/annualTariffPlans';
import { TariffPlanTypeEntity } from 'modules/subscriptions/entities/tariff-plan-type.entity';
import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';

export class AddingAnnualTariffPlans1697447968485
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    const tariffPlanTypeRepository =
      queryRunner.manager.getRepository(TariffPlanTypeEntity);
    const yearlyTariffPlanType = await tariffPlanTypeRepository.findOne({
      where: {
        name: TariffPlanTypesEnum.yearly,
      },
    });
    const data = [];
    for (const item of annualTariffPlans) {
      const { name, ...settings } = item;
      data.push({
        tariffPlan: { id: item.tariffPlanId },
        ...settings,
        type: { id: yearlyTariffPlanType.id },
      });
    }
    await builder.insert().into(TariffPlanSettingEntity).values(data).execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
