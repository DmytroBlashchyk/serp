import { LoggingService } from 'modules/logging/services/logging.service';
import { Job } from 'bull';
import { BullQueueEvents, OnQueueActive, OnQueueEvent } from '@nestjs/bull';

export abstract class BaseQueue {
  constructor(protected readonly loggingService: LoggingService) {}

  /**
   * This method is called when a job becomes active in the queue.
   *
   * @param {Job} job - The job that is being processed.
   * @return {void} No return value.
   */
  @OnQueueActive()
  onActive(job: Job): void {
    this.loggingService.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}`,
    );
  }

  /**
   * Handles the event when a job is completed in the queue.
   *
   * @param {Job} job - The job that has been completed.
   * @return {void} This method does not return a value.
   */
  @OnQueueEvent(BullQueueEvents.COMPLETED)
  onCompleted(job: Job): void {
    const timeTaken = (Date.now() - job.processedOn) / 1000;

    this.loggingService.log(
      `Completed job ${job.id} of type ${job.name} with result ${job.returnvalue}. ` +
        `Time taken: ${timeTaken} seconds.`,
    );
  }

  /**
   * Handles the event when a job fails in the Bull queue.
   *
   * @param {Job} job - The job object that has failed. Contains details such as job id, name, processed time, failed reason, and stack trace.
   * @return {void} This method does not return a value.
   */
  @OnQueueEvent(BullQueueEvents.FAILED)
  onFailed(job: Job) {
    const timeTaken = (Date.now() - job.processedOn) / 1000;
    this.loggingService.error(
      `Failed job ${job.id} of type ${job.name}` +
        `Time taken: ${timeTaken} seconds. Fail reason: ${job.failedReason}`,
      job.stacktrace.join('\n; '),
    );
  }
}
