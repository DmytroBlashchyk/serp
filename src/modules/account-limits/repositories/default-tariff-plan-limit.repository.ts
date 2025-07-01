import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';

@Injectable()
@EntityRepository(DefaultTariffPlanLimitEntity)
export class DefaultTariffPlanLimitRepository extends BaseRepository<DefaultTariffPlanLimitEntity> {
  /**
   * Fetches all default limits associated with the specified tariff plan.
   *
   * @param {TariffPlansEnum} tariffPlanName - The name of the tariff plan for which to retrieve limits.
   * @return {Promise<DefaultTariffPlanLimitEntity[]>} A promise that resolves to an array of limit entities associated with the specified tariff plan.
   */
  async getAllLimitsByTariffPlan(
    tariffPlanName: TariffPlansEnum,
  ): Promise<DefaultTariffPlanLimitEntity[]> {
    return this.createQueryBuilder('default_tariff_plan_limits')
      .leftJoinAndSelect('default_tariff_plan_limits.limitType', 'limitType')
      .leftJoin('default_tariff_plan_limits.tariffPlan', 'tariffPlan')
      .where('tariffPlan.name =:tariffPlanName', { tariffPlanName })
      .getMany();
  }
}
