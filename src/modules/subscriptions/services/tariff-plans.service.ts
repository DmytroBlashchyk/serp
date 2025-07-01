import { Injectable, NotFoundException } from '@nestjs/common';
import { TariffPlanRepository } from 'modules/subscriptions/repositories/tariff-plan.repository';
import { TariffPlansResponse } from 'modules/subscriptions/responses/tariff-plans.response';
import { TariffPlanSettingsResponse } from 'modules/subscriptions/responses/tariff-plan-settings.response';
import { TariffPlanResponse } from 'modules/subscriptions/responses/tariff-plan.response';
import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { IdType } from 'modules/common/types/id-type.type';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { DefaultTariffPlanLimitRepository } from 'modules/account-limits/repositories/default-tariff-plan-limit.repository';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';

@Injectable()
export class TariffPlansService {
  constructor(
    private readonly tariffPlanRepository: TariffPlanRepository,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly accountRepository: AccountRepository,
    private readonly defaultTariffPlanLimitRepository: DefaultTariffPlanLimitRepository,
  ) {}

  /**
   * Retrieves tariff plans based on the specified type and optional account ID.
   *
   * @param {TariffPlanTypesEnum} type - The type of tariff plans to retrieve.
   * @param {IdType} accountId - The optional account ID to filter tariff plans by subscription.
   * @return {Promise<TariffPlansResponse>} A promise that resolves to a response containing the tariff plans.
   */
  async getTariffPlans(
    type: TariffPlanTypesEnum,
    accountId: IdType,
  ): Promise<TariffPlansResponse> {
    const tariffPlans = await this.tariffPlanRepository.getTariffPlansByType(
      type,
    );
    if (accountId) {
      const account = await this.accountRepository.getAccountWithSubscription(
        accountId,
      );
      if (!account) {
        throw new NotFoundException('Subscription account not found.');
      }
      return new TariffPlansResponse({
        items: tariffPlans.map((item) => {
          return new TariffPlanResponse({
            ...item,
            settings: new TariffPlanSettingsResponse({
              ...item.setting,
              currentTariffPlan:
                item.setting.id === account.subscription.tariffPlanSetting.id,
              dailyWordCount:
                item.defaultTariffPlanLimits.find(
                  (i) =>
                    i.limitType.name ===
                    LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
                )?.limit ?? 0,
              monthlyWordCount:
                item.defaultTariffPlanLimits.find(
                  (i) =>
                    i.limitType.name ===
                    LimitTypesEnum.NumberOfMonthlyUpdatesOfKeywordPositions,
                )?.limit ?? 0,
            }),
          });
        }),
      });
    } else {
      return new TariffPlansResponse({
        items: tariffPlans.map((item) => {
          return new TariffPlanResponse({
            ...item,
            settings: new TariffPlanSettingsResponse({
              ...item.setting,
              dailyWordCount:
                item.defaultTariffPlanLimits.find(
                  (i) =>
                    i.limitType.name ===
                    LimitTypesEnum.NumberOfDailyUpdatesOfKeywordPositions,
                )?.limit ?? 0,
              monthlyWordCount:
                item.defaultTariffPlanLimits.find(
                  (i) =>
                    i.limitType.name ===
                    LimitTypesEnum.NumberOfMonthlyUpdatesOfKeywordPositions,
                )?.limit ?? 0,
            }),
          });
        }),
      });
    }
  }

  /**
   * Fetches the tariff plan settings associated with the specified Paddle product ID.
   *
   * @param {string} paddleProductId - The ID of the Paddle product.
   * @return {Promise<TariffPlanSettingEntity>} The tariff plan settings corresponding to the specified Paddle product ID.
   * @throws {NotFoundException} Throws if no tariff plan is found with the specified Paddle product ID.
   */
  async getTariffPlan(
    paddleProductId: string,
  ): Promise<TariffPlanSettingEntity> {
    const tariffPlan =
      await this.tariffPlanSettingRepository.getTariffPlansByPaddleId(
        paddleProductId,
      );
    if (!tariffPlan) {
      throw new NotFoundException('Tariff plan not found.');
    }
    return tariffPlan;
  }

  /**
   * Retrieves the tariff plan settings with limits for a given Paddle product ID.
   *
   * @param {string} paddleProductId - The ID of the Paddle product.
   * @return {Promise<DefaultTariffPlanLimitEntity[]>} A promise that resolves to
   * an array of DefaultTariffPlanLimitEntity objects that contain the limits of
   * the tariff plan associated with the given Paddle product ID.
   * @throws {NotFoundException} If the tariff plan setting is not found for
   * the given Paddle product ID.
   */
  async getTariffPlanSettingWithLimits(
    paddleProductId: string,
  ): Promise<DefaultTariffPlanLimitEntity[]> {
    const tariffPlanSetting =
      await this.tariffPlanSettingRepository.getTariffPlansByPaddleId(
        paddleProductId,
      );
    if (!tariffPlanSetting) {
      throw new NotFoundException('Tariff Plan Setting not found.');
    }
    return this.defaultTariffPlanLimitRepository.getAllLimitsByTariffPlan(
      tariffPlanSetting.tariffPlan.name,
    );
  }
}
