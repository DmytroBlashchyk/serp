import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TransactionEntity } from 'modules/transactions/entities/transaction.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';
import { GetInvoicesRequest } from 'modules/subscriptions/requests/get-invoices.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { TransactionStatusesEnum } from 'modules/transactions/enums/transaction-statuses.enum';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortInvoiceEnum } from 'modules/subscriptions/enums/sort-invoice.enum';

@Injectable()
@EntityRepository(TransactionEntity)
export class TransactionRepository extends BaseRepository<TransactionEntity> {
  /**
   * Retrieves a paginated list of account transactions based on the specified options.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {GetInvoicesRequest} options - The pagination and sorting options.
   * @return {Promise<Pagination<TransactionEntity>>} A promise that resolves to a paginated list of transaction entities.
   */
  async paginatedAccountTransactions(
    accountId: IdType,
    options: GetInvoicesRequest,
  ): Promise<Pagination<TransactionEntity>> {
    const queryBuilder = this.createQueryBuilder('transactions')
      .withDeleted()
      .leftJoinAndSelect('transactions.tariffPlanSetting', 'tariffPlanSetting')
      .leftJoinAndSelect('transactions.status', 'status')
      .leftJoinAndSelect('tariffPlanSetting.type', 'type')
      .leftJoinAndSelect('tariffPlanSetting.tariffPlan', 'tariffPlan')
      .leftJoin('transactions.account', 'account')
      .where('account.id =:accountId and status.name =:statusName', {
        accountId,
        statusName: TransactionStatusesEnum.completed,
      });
    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortInvoiceEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('transactions.createdAt', options.sortOrder);
    }

    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }

  /**
   * Retrieves a transaction by its transaction ID.
   *
   * @param {string} transactionId - The unique identifier of the transaction to retrieve.
   * @return {Promise<TransactionEntity>} A promise that resolves to the transaction entity with the specified transaction ID.
   */
  async getTransactionByTransactionId(
    transactionId: string,
  ): Promise<TransactionEntity> {
    return this.createQueryBuilder('transactions')
      .leftJoinAndSelect('transactions.status', 'status')
      .where('transactions.transactionId =:transactionId', { transactionId })
      .getOne();
  }

  /**
   * Retrieves the last transaction of a specific account.
   *
   * @param {IdType} accountId - The ID of the account whose last transaction is to be retrieved.
   * @return {Promise<TransactionEntity>} A promise that resolves to the last transaction entity of the specified account.
   */
  async retrieveLastTransactionOfAccount(
    accountId: IdType,
  ): Promise<TransactionEntity> {
    return this.createQueryBuilder('transactions')
      .withDeleted()
      .leftJoinAndSelect('transactions.account', 'account')
      .leftJoinAndSelect('transactions.status', 'status')
      .where('account.id =:accountId', { accountId })
      .orderBy('transactions.id', 'DESC')
      .getOne();
  }
}
