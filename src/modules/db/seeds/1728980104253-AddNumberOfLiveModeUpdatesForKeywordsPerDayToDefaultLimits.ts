import { MigrationInterface, QueryRunner } from 'typeorm';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';
import { numberOfLiveModeUpdatesForKeywordsPerDayForTariffPlans } from 'modules/db/seeds/data/1728980104253-AddNumberOfLiveModeUpdatesForKeywordsPerDayToDefaultLimits/numberOfLiveModeUpdatesForKeywordsPerDayForTariffPlans';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class AddNumberOfLiveModeUpdatesForKeywordsPerDayToDefaultLimits1728980104253
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    const data = [];
    for (const tariffPlan of numberOfLiveModeUpdatesForKeywordsPerDayForTariffPlans) {
      const item = await queryRunner.manager.findOne(TariffPlanEntity, {
        where: { name: tariffPlan.tariffPlanName },
      });
      if (!item) {
        throw new NotFoundException(
          `Tariff Plan by name ${tariffPlan.tariffPlanName} not found`,
        );
      }
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
    return;
  }
}
