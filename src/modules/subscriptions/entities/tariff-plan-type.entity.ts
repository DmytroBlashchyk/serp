import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { TariffPlanTypesEnum } from 'modules/subscriptions/enums/tariff-plan-types.enum';
import { Entity } from 'typeorm';

@Entity('tariff_plan_types')
export class TariffPlanTypeEntity extends BaseEnumEntity<TariffPlanTypesEnum> {}
