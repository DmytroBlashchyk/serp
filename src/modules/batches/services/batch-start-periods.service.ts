import { Injectable, NotFoundException } from '@nestjs/common';
import { BatchStartPeriodsEnum } from 'modules/batches/enums/batch-start-periods.enum';
import { BatchStartPeriodsRepository } from 'modules/batches/repositories/batch-start-periods.repository';
import { BatchStartPeriodEntity } from 'modules/batches/entities/batch-start-period.entity';

@Injectable()
export class BatchStartPeriodsService {
  constructor(
    private readonly batchStartPeriodsRepository: BatchStartPeriodsRepository,
  ) {}

  /**
   * Retrieves a batch start period based on the provided name.
   *
   * @param {BatchStartPeriodsEnum} name - The name of the batch start period to retrieve.
   * @return {Promise<BatchStartPeriodEntity>} A promise that resolves to the retrieved batch start period entity.
   * @throws {NotFoundException} Throws an exception if the batch start period is not found.
   */
  async getBatchStartPeriod(
    name: BatchStartPeriodsEnum,
  ): Promise<BatchStartPeriodEntity> {
    const batchStartPeriod =
      await this.batchStartPeriodsRepository.getBatchStartPeriodByName(name);
    if (!batchStartPeriod) {
      throw new NotFoundException('Batch start period not found.');
    }
    return batchStartPeriod;
  }
}
