import { Process, Processor } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { Job } from 'bull';
import { TriggersService } from 'modules/triggers/services/triggers.service';
import { BaseQueue } from 'modules/queue/queues/base.queue';
import { LoggingService } from 'modules/logging/services/logging.service';

@Processor(Queues.Triggers)
export class TriggersQueue extends BaseQueue {
  constructor(
    protected readonly loggingService: LoggingService,
    private readonly triggersService: TriggersService,
  ) {
    super(loggingService);
  }
  /**
   * Method that triggers the initialization process for a given job.
   *
   * @param {Job} job - The job object containing necessary data for the initialization process.
   * @return {Promise<void>} A promise that resolves once the initialization process is complete.
   */
  @Process({ name: QueueEventEnum.TriggerInitialization, concurrency: 1 })
  async triggerInitialization(job: Job): Promise<void> {
    await this.triggersService.initializationOfTriggers(job.data.id);
  }
}
