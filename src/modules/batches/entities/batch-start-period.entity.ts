import { BaseEnumEntity } from 'modules/db/entities/base-enum.entity';
import { BatchStartPeriodsEnum } from 'modules/batches/enums/batch-start-periods.enum';
import { Entity } from 'typeorm';

@Entity('batch_start_periods')
export class BatchStartPeriodEntity extends BaseEnumEntity<BatchStartPeriodsEnum> {}
