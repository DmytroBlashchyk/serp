import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';

@Entity('default_tariff_plan_limits')
export class DefaultTariffPlanLimitEntity extends BaseEntity {
  @ManyToOne(() => TariffPlanEntity, { onDelete: 'CASCADE' })
  tariffPlan: TariffPlanEntity;

  @ManyToOne(() => LimitTypeEntity, { onDelete: 'CASCADE' })
  limitType: LimitTypeEntity;

  @Column({ type: 'numeric', default: 0 })
  limit: number;
}
