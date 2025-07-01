import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { Entity, OneToMany } from 'typeorm';
import { LimitTypesEnum } from 'modules/account-limits/enums/limit-types.enum';
import { DefaultTariffPlanLimitEntity } from 'modules/account-limits/entities/default-tariff-plan-limit.entity';

@Entity('limit_types')
export class LimitTypeEntity extends BaseEnumEntity<LimitTypesEnum> {
  @OneToMany(
    () => DefaultTariffPlanLimitEntity,
    (defaultTariffPlanLimit) => defaultTariffPlanLimit.limitType,
  )
  defaultTariffPlanLimits: DefaultTariffPlanLimitEntity[];
}
