import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { TariffPlanEntity } from 'modules/subscriptions/entities/tariff-plan.entity';
import { TariffPlanTypeEntity } from 'modules/subscriptions/entities/tariff-plan-type.entity';

@Entity('tariff_plan_settings')
export class TariffPlanSettingEntity extends BaseEntity {
  @ManyToOne(() => TariffPlanEntity)
  tariffPlan: TariffPlanEntity;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'text' })
  paddleProductId: string;

  @ManyToOne(() => TariffPlanTypeEntity, { nullable: true })
  type: TariffPlanTypeEntity;
}
