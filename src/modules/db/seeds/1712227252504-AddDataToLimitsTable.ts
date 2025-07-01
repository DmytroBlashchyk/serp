import { MigrationInterface, QueryRunner } from 'typeorm';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';
import { tariffPlanLimits } from 'modules/db/seeds/data/1712227252504-AddDataToLimitsTable/tariffPlanLimits';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';

export class AddDataToLimitsTable1712227252504 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    const data = [];
    for (const tariffPlan of tariffPlanLimits) {
      const item = await queryRunner.manager.findOne(TariffPlanEntity, {
        where: { name: tariffPlan.tariffPlanName },
      });
      const limit = await queryRunner.manager.findOne(LimitTypeEntity, {
        where: { name: tariffPlan.limitTypeName },
      });
      data.push({
        tariffPlan: item,
        limitType: limit,
        limit: tariffPlan.limit,
      });
    }
    await builder
      .insert()
      .into(DefaultTariffPlanLimitEntity)
      .values(data)
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(DefaultTariffPlanLimitEntity, {});
  }
}
