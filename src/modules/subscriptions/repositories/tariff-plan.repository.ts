import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';

@Injectable()
@EntityRepository(TariffPlanEntity)
export class TariffPlanRepository extends BaseRepository<TariffPlanEntity> {
  /**
   * Retrieves a list of tariff plans by their type.
   *
   * @param {TariffPlanTypesEnum} type - The type of tariff plan to be retrieved.
   * @return {Promise<TariffPlanEntity[]>} A promise resolving to an array of TariffPlanEntity objects.
   */
  async getTariffPlansByType(
    type: TariffPlanTypesEnum,
  ): Promise<TariffPlanEntity[]> {
    return this.createQueryBuilder('tariff_plans')
      .leftJoinAndSelect('tariff_plans.setting', 'setting')
      .leftJoinAndSelect(
        'tariff_plans.defaultTariffPlanLimits',
        'defaultTariffPlanLimits',
      )
      .leftJoinAndSelect('defaultTariffPlanLimits.limitType', 'limitType')
      .leftJoinAndSelect('setting.type', 'type')
      .where('type.name =:typeName', { typeName: type })
      .orderBy('tariff_plans.id', 'ASC')
      .getMany();
  }
}
