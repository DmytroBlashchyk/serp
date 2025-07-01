import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { TransactionStatusEntity } from 'modules/transactions/entities/transaction-status.entity';

export class AddPaymentFailedToTransactionStatuses1714638029376
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(TransactionStatusEntity, builder, [
      { name: 'payment failed' },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(TransactionStatusEntity, builder, [
      { name: 'payment failed' },
    ]);
  }
}
