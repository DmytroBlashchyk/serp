import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';

@Injectable()
export class LocationsJobEmitter {
  constructor(
    @InjectQueue(Queues.Locations)
    private readonly locationsQueue: Queue,
  ) {}

  async emitAddNewKeywordDataLocationsForBing() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewKeywordDataLocationsForBing,
      {},
      { timeout: 3600000 },
    );
  }

  async emitAddNewKeywordDataLocationsForGoogle() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewKeywordDataLocationsForGoogle,
      {},
      { timeout: 3600000 },
    );
  }

  async emitAddNewLocationsForBingSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewLocationsForBingSERP,
      {},
      { timeout: 3600000 },
    );
  }

  async emitAddNewLocationsForYahooSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewLocationsForYahooSERP,
      {},
      { timeout: 3600000 },
    );
  }
  async emitAddNewLocationsForBaiduSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewLocationsForBaiduSERP,
      {},
      { timeout: 3600000 },
    );
  }

  async emitAddNewLocationsForYoutubeSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewLocationsForYoutubeSERP,
      {},
      { timeout: 3600000 },
    );
  }

  async emitAddNewLocationsForGoogleSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.AddNewLocationsForGoogleSERP,
      {},
      { timeout: 3600000 },
    );
  }

  async emitUpdateLocationsForBingKeywordData() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateKeywordDataLocationsForBing,
      {},
      { timeout: 1200000 },
    );
  }

  async emitUpdateLocationsForGoogleKeywordData() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateKeywordDataLocationsForGoogle,
      {},
      { timeout: 1200000 },
    );
  }

  async emitUpdateLocationsForYahooSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateLocationsForYahooSERP,
      {},
      { timeout: 1200000 },
    );
  }

  async emitUpdateLocationsForYoutubeSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateLocationsForYoutubeSERP,
      {},
      { timeout: 1200000 },
    );
  }

  async emitUpdateLocationsForBingSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateLocationsForBingSERP,
      {},
      { timeout: 1200000 },
    );
  }

  async emitUpdateLocationsForBaiduSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateLocationsForBaiduSERP,
      {},
      { timeout: 1200000 },
    );
  }

  async emitUpdateLocationsForGoogleSERP() {
    await this.locationsQueue.add(
      QueueEventEnum.UpdateLocationsForGoogleSERP,
      {},
      { timeout: 1200000 },
    );
  }
}
