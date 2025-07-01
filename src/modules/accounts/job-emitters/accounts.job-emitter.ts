import { Injectable } from '@nestjs/common';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';

@Injectable()
export class AccountsJobEmitter {
  constructor(
    @InjectQueue(Queues.Accounts)
    private readonly accountsQueue: Queue,
  ) {}
  /**
   * Assigns a limit to the number of live mode updates for keywords per day to existing accounts.
   * This method enqueues the operation for further processing.
   *
   * @return {Promise<void>} A promise that resolves when the operation has been successfully enqueued.
   */
  async assignALimitOfNumberOfLiveModeUpdatesForKeywordsPerDayToExistingAccounts(): Promise<void> {
    await this.accountsQueue.add(
      QueueEventEnum.AssignALimitOfNumberOfLiveModeUpdatesForKeywordsPerDayToExistingAccounts,
    );
  }
}
