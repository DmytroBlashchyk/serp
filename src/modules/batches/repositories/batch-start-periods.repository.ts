import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { BatchStartPeriodEntity } from 'modules/batches/entities/batch-start-period.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { BatchStartPeriodsEnum } from 'modules/batches/enums/batch-start-periods.enum';

@Injectable()
@EntityRepository(BatchStartPeriodEntity)
export class BatchStartPeriodsRepository extends BaseRepository<BatchStartPeriodEntity> {
  /**
   * Retrieves a BatchStartPeriodEntity corresponding to the given name.
   *
   * @param {BatchStartPeriodsEnum} name - The name of the batch start period to be retrieved.
   * @return {Promise<BatchStartPeriodEntity>} A promise that resolves to the BatchStartPeriodEntity.
   */
  async getBatchStartPeriodByName(
    name: BatchStartPeriodsEnum,
  ): Promise<BatchStartPeriodEntity> {
    return this.findOne({ where: { name } });
  }
}
