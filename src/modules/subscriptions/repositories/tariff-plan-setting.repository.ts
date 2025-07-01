import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(TariffPlanSettingEntity)
export class TariffPlanSettingRepository extends BaseRepository<TariffPlanSettingEntity> {
  /**
   * Fetches the trial tariff plan's settings from the database.
   *
   * @return {Promise<TariffPlanSettingEntity>} A promise that resolves to the trial tariff plan setting entity.
   */
  async getTrialTariffPlan(): Promise<TariffPlanSettingEntity> {
    return this.createQueryBuilder('tariff_plan_settings')
      .leftJoinAndSelect('tariff_plan_settings.tariffPlan', 'tariffPlan')
      .where('tariffPlan.name =:name', {
        name: TariffPlansEnum.TrialPeriod,
      })
      .getOne();
  }

  /**
   * Retrieves the tariff plan settings by the given ID.
   *
   * @param {IdType} id - The ID of the tariff plan settings to retrieve.
   * @return {Promise<TariffPlanSettingEntity>} A promise that resolves to the tariff plan settings entity.
   */
  async getTariffPlanById(id: IdType): Promise<TariffPlanSettingEntity> {
    return this.createQueryBuilder('tariff_plan_settings')
      .leftJoinAndSelect('tariff_plan_settings.tariffPlan', 'tariffPlan')
      .where('tariff_plan_settings.id =:id', { id })
      .getOne();
  }

  /**
   * Retrieves tariff plans and their related settings by the given Paddle product ID.
   *
   * @param {string} paddleProductId - The ID of the Paddle product to filter the tariff plans.
   * @return {Promise<TariffPlanSettingEntity>} A promise that resolves to a TariffPlanSettingEntity object containing the tariff plan settings.
   */
  async getTariffPlansByPaddleId(
    paddleProductId: string,
  ): Promise<TariffPlanSettingEntity> {
    return this.createQueryBuilder('tariff_plan_settings')
      .leftJoinAndSelect('tariff_plan_settings.tariffPlan', 'tariffPlan')
      .leftJoinAndSelect(
        'tariffPlan.defaultTariffPlanLimits',
        'defaultTariffPlanLimits',
      )
      .leftJoinAndSelect('defaultTariffPlanLimits.limitType', 'limitType')
      .leftJoinAndSelect('tariff_plan_settings.type', 'type')
      .where('tariff_plan_settings.paddleProductId =:paddleProductId', {
        paddleProductId,
      })
      .getOne();
  }
}
