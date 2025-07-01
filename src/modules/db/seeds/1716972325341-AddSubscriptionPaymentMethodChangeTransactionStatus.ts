import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TransactionStatusEntity } from 'modules/transactions/entities/transaction-status.entity';

export class AddSubscriptionPaymentMethodChangeTransactionStatus1716972325341
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TransactionStatusEntity, builder, [
      { name: 'subscription payment method change' },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TransactionStatusEntity, builder, [
      { name: 'subscription payment method change' },
    ]);
  }
}
