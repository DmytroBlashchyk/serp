import { BaseEntity } from 'modules/db/entities/base-entity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';
import { BatchStartPeriodEntity } from 'modules/batches/entities/batch-start-period.entity';

@Entity({ name: 'batches' })
export class BatchEntity extends BaseEntity {
  @ManyToOne(() => BatchStartPeriodEntity)
  startPeriod: BatchStartPeriodEntity;

  @ManyToOne(() => CheckFrequencyEntity)
  frequency: CheckFrequencyEntity;

  @Column({ type: 'boolean', nullable: true })
  updated?: boolean;

  @Column({ type: 'text' })
  batchValueSerpId: string;

  @Column('jsonb', { nullable: true })
  pages: object[];
}
