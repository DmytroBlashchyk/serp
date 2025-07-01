import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TransactionStatusEntity } from 'modules/transactions/entities/transaction-status.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';

@Injectable()
@EntityRepository(TransactionStatusEntity)
export class TransactionStatusRepository extends BaseRepository<TransactionStatusEntity> {
  /**
   * Fetches the status details corresponding to the given status name.
   *
   * @param {TransactionStatusesEnum} name The name of the transaction status to retrieve.
   * @return {Promise<TransactionStatusEntity>} A promise that resolves to the transaction status entity.
   */
  async getStatusByName(
    name: TransactionStatusesEnum,
  ): Promise<TransactionStatusEntity> {
    return this.createQueryBuilder('transaction_statuses')
      .where('transaction_statuses.name =:name', { name })
      .getOne();
  }
}
