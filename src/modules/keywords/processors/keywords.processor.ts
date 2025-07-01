import { BaseQueue } from 'modules/queue/queues/base.queue';
import { Process, Processor } from '@nestjs/bull';
import { App } from 'modules/queue/enums/app.enum';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';
import { Job } from 'bull';
import { EventBus } from '@nestjs/cqrs';
import { LoggingService } from 'modules/logging/services/logging.service';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { UpdateDataForKeywordRankingsEvent } from 'modules/keywords/events/update-data-for-keyword-rankings.event';

@Processor(App.Keywords)
export class KeywordsProcessor extends BaseQueue {
  constructor(
    private readonly eventBus: EventBus,
    protected readonly loggingService: LoggingService,
  ) {
    super(loggingService);
  }
  /**
   * Initiates the process of updating keywords by publishing a StartOfKeywordUpdateEvent using eventBus.
   *
   * @param {Job} job - The job instance containing data needed for the keyword update process.
   * @return {Promise<void>} A promise that resolves when the event has been successfully published.
   */
  @Process({
    name: AppEventEnum.StartOfKeywordUpdate,
  })
  async startOfKeywordUpdate(job: Job): Promise<void> {
    await this.eventBus.publish(
      new StartOfKeywordUpdateEvent({
        keywordIds: job.data.keywordIds,
      }),
    );
  }

  /**
   * Update the data for keyword rankings.
   *
   * @param {Job} job - The job object containing the keyword ID and other relevant data.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  @Process({
    name: AppEventEnum.UpdateDataForKeywordRankings,
  })
  async updateDataForKeywordRankings(job: Job): Promise<void> {
    await this.eventBus.publish(
      new UpdateDataForKeywordRankingsEvent({
        keywordIds: [job.data.keywordId],
      }),
    );
  }
}
