import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { BatchEntity } from 'modules/batches/entities/batch.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(BatchEntity)
export class BatchRepository extends BaseRepository<BatchEntity> {
  /**
   * Retrieves a batch entity based on the given batchValueSerpId.
   *
   * @param {string} batchValueSerpId - The unique identifier for the batch value in SERP.
   * @return {Promise<BatchEntity>} - A promise that resolves to the batch entity.
   */
  async getBatchByBatchValueSerpId(
    batchValueSerpId: string,
  ): Promise<BatchEntity> {
    return this.findOne({ where: { batchValueSerpId } });
  }
}
