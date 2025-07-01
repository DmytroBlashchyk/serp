import { MigrationInterface, QueryRunner } from 'typeorm';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { TariffPlanTypeEntity } from 'modules/subscriptions/entities/tariff-plan-type.entity';
import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';

export class AddingATypeOfTariffPlan1697443879397
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tariffPlanSettings = (await queryRunner.query(
      'select * from tariff_plan_settings where type_id IS NULL',
    )) as TariffPlanSettingEntity[];
    const tariffPlanTypes = (await queryRunner.query(
      `select * from tariff_plan_types`,
    )) as TariffPlanTypeEntity[];
    const monthlyType = tariffPlanTypes.find(
      (item) => item.name === TariffPlanTypesEnum.monthly,
    );
    const tariffPlanSettingRepository = queryRunner.manager.getRepository(
      TariffPlanSettingEntity,
    );
    const data = [];
    for (const item of tariffPlanSettings) {
      data.push({ ...item, type: monthlyType });
    }
    await tariffPlanSettingRepository.save(data);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.manager.createQueryBuilder();
  }
}
