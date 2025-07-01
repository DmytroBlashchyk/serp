import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { BatchStartPeriodsEnum } from 'modules/batches/enums/batch-start-periods.enum';

export interface CreateBatchType {
  scheduleType: CheckFrequencyEnum;
  startTime: BatchStartPeriodsEnum;
}
