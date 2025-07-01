import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { Entity, OneToMany, OneToOne } from 'typeorm';
import { TariffPlanSettingEntity } from 'modules/subscriptions/entities/tariff-plan-setting.entity';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';

@Entity('tariff_plans')
export class TariffPlanEntity extends BaseEnumEntity<TariffPlansEnum> {
  @OneToOne(() => TariffPlanSettingEntity, (setting) => setting.tariffPlan)
  setting: TariffPlanSettingEntity;

  @OneToMany(
    () => DefaultTariffPlanLimitEntity,
    (defaultTariffPlanLimit) => defaultTariffPlanLimit.tariffPlan,
  )
  defaultTariffPlanLimits: DefaultTariffPlanLimitEntity[];
}
