import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TransactionStatusEntity } from 'modules/transactions/entities/transaction-status.entity';
import { transactionStatuses } from 'modules/db/seeds/data/1696925781891-AddTransactionStatuses/transactionStatuses';

export class AddTransactionStatuses1696925781891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TransactionStatusEntity, builder, transactionStatuses);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TransactionStatusEntity, builder, transactionStatuses);
  }
}
