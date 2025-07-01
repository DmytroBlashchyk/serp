import { Injectable, NotFoundException } from '@nestjs/common';
import { BatchRepository } from 'modules/batches/repositories/batch.repository';
import { ValueSerpService } from 'modules/additional-services/services/value-serp.service';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { CheckFrequencyService } from 'modules/check-frequency/services/check-frequency.service';
import { BatchStartPeriodsService } from 'modules/batches/services/batch-start-periods.service';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { BatchEntity } from 'modules/batches/entities/batch.entity';
import { BatchStartPeriodsEnum } from 'modules/batches/enums/batch-start-periods.enum';
import { ResultSetType } from 'modules/additional-services/types/result-set.type';
import { BatchType } from 'modules/additional-services/types/batch.type';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { CreateKeywordsResultsType } from 'modules/keywords/types/create-keywords-results.type';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
export class BatchesService {
  constructor(
    @InjectQueue(Queues.UpdateKeywordPosition)
    private readonly updateKeywordPositionQueue: Queue,
    private readonly batchRepository: BatchRepository,
    private readonly valueSerpService: ValueSerpService,
    private readonly checkFrequencyService: CheckFrequencyService,
    private readonly batchStartPeriodsService: BatchStartPeriodsService,
    private readonly keywordRepository: KeywordRepository,
  ) {}

  /**
   * Saves the positions of given keywords and triggers updates in the relevant queues.
   *
   * @param {Array<Object>} keywordPositions - An array of keyword position objects.
   * Each object contains the keyword id, position, and url.
   * @param {Object} keywordPositions[].keyword - The keyword object.
   * @param {IdType} keywordPositions[].keyword.id - The unique identifier of the keyword.
   * @param {number} keywordPositions[].position - The position of the keyword.
   * @param {string} keywordPositions[].url - The URL associated with the keyword.
   *
   * @returns {Promise<void>} A promise indicating the completion of the operation.
   */
  @Transactional()
  async saveKeywordPositions(
    keywordPositions: {
      keyword: { id: IdType };
      position: number;
      url: string;
    }[],
  ): Promise<void> {
    const keywords = [];
    const ids = [];
    for (const item of keywordPositions) {
      keywords.push(item.keyword);
      ids.push(item.keyword.id);
    }
    await this.updateKeywordPositionQueue.add(
      QueueEventEnum.UpdatePositionUpdate,
      {
        keywords,
      },
    );

    await this.updateKeywordPositionQueue.add(
      QueueEventEnum.UpdateProjectsByKeywordIds,
      {
        ids,
      },
    );
  }

  /**
   * Saves the search results by adding tasks to a queue for processing.
   *
   * @param {CreateKeywordsResultsType[]} payload - An array of keyword result objects to be processed and saved.
   *
   * @return {Promise<void>} A promise that resolves when all tasks have been added to the queue.
   */
  async saveSearchResult(payload: CreateKeywordsResultsType[]): Promise<void> {
    await this.updateKeywordPositionQueue.add(
      QueueEventEnum.CreateKeywordsResults,
      { searchResult: payload },
    );

    for (const item of payload) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.DeterminePositionOfCompetitorsKeywords,
        {
          keywordId: item.keywordId,
        },
      );
    }
  }

  /**
   * Refreshes the given keywords by creating a batch and adding keywords for refresh.
   * @param {KeywordEntity[]} keywords - The array of keyword entities to be refreshed.
   * @return {Promise<void>} A promise that resolves when the refresh operation is complete.
   */
  @Transactional()
  async refreshKeywords(keywords: KeywordEntity[]): Promise<void> {
    if (keywords.length === 0) {
      return;
    }
    const batch = await this.createBatchForProjectKeywordsRefresh();

    await this.addKeywordsForRefresh(keywords, batch);
  }

  /**
   * Processes a batch search operation. Fetches pages from the payload and updates the batch with new information.
   *
   * @param {ResultSetType} payload - The result set containing data and download links with pages.
   * @param {BatchType} batchPayload - The batch data with an identifier used to fetch the batch.
   * @return {Promise<void>} - A promise that resolves to void after the batch has been processed and updated.
   */
  @Transactional()
  async batchSearchProcessing(
    payload: ResultSetType,
    batchPayload: BatchType,
  ): Promise<void> {
    const pages = payload.download_links.json.pages as any;
    const batch = await this.getBatchByBatchValueSerpId(batchPayload.id);
    await this.batchRepository.save({ ...batch, updated: true, pages });
  }

  /**
   * Retrieves a batch by its batch value SERP ID.
   *
   * @param {string} batchValueSerpId - The SERP ID associated with the batch value.
   * @return {Promise<Object>} A promise that resolves to the retrieved batch object.
   * @throws {NotFoundException} If no batch is found with the given SERP ID.
   */
  async getBatchByBatchValueSerpId(batchValueSerpId: string) {
    const batch = await this.batchRepository.getBatchByBatchValueSerpId(
      batchValueSerpId,
    );
    if (!batch) {
      throw new NotFoundException('Batch not found.');
    }
    return batch;
  }

  /**
   * Creates a new batch for refreshing project keywords.
   * This method coordinates with several services to gather necessary
   * information, such as batch start period and check frequency, before
   * saving the batch information.
   *
   * @return {Promise<BatchEntity>} A promise that resolves to the created BatchEntity.
   */
  async createBatchForProjectKeywordsRefresh(): Promise<BatchEntity> {
    const valueSerpBatch = await this.valueSerpService.createBatchForRefresh();
    const startTimePeriod =
      await this.batchStartPeriodsService.getBatchStartPeriod(
        BatchStartPeriodsEnum.Now,
      );

    const frequency = await this.checkFrequencyService.getCheckFrequency(
      CheckFrequencyEnum.Now,
    );
    return this.batchRepository.save({
      batchValueSerpId: valueSerpBatch.id,
      frequency,
      startPeriod: startTimePeriod,
    });
  }

  /**
   * Creates a new batch with specified frequency and start time period.
   *
   * @param {CheckFrequencyEnum} frequencyName - The name of the check frequency for the batch.
   * @param {BatchStartPeriodsEnum} startTimePeriodName - The name of the start time period for the batch.
   * @return {Promise<BatchEntity>} The newly created BatchEntity.
   */
  async create(
    frequencyName: CheckFrequencyEnum,
    startTimePeriodName: BatchStartPeriodsEnum,
  ): Promise<BatchEntity> {
    const startTimePeriod =
      await this.batchStartPeriodsService.getBatchStartPeriod(
        startTimePeriodName,
      );
    const valueSerpBatch = await this.valueSerpService.createBatch({
      scheduleType: frequencyName,
      startTime: startTimePeriod.name,
    });
    const frequency = await this.checkFrequencyService.getCheckFrequency(
      frequencyName,
    );
    return this.batchRepository.save({
      batchValueSerpId: valueSerpBatch.id,
      frequency,
      startPeriod: startTimePeriod,
    });
  }

  /**
   * Adds the provided keywords to the specified batch for refreshing and starts the batch process.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity instances to be added.
   * @param {BatchEntity} batch - The BatchEntity representing the batch to which the keywords will be added.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async addKeywordsForRefresh(
    keywords: KeywordEntity[],
    batch: BatchEntity,
  ): Promise<void> {
    await this.valueSerpService.addKeywordToBatch(
      batch.batchValueSerpId,
      keywords,
    );
    await this.keywordRepository.uprateKeywords(
      keywords.map((keyword) => keyword.id),
      true,
    );
    await this.valueSerpService.startBatch(batch.batchValueSerpId);
  }
}
