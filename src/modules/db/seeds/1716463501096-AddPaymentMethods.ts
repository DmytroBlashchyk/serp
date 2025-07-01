import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { TransactionStatusEntity } from 'modules/transactions/entities/transaction-status.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { paymentMethods } from 'modules/db/seeds/data/1716463501096-AddPaymentMethods/paymentMethods';
import { PaymentMethodEntity } from 'modules/payments/entities/payment-method.entity';

export class AddPaymentMethods1716463501096 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await applySeedEnum(PaymentMethodEntity, builder, paymentMethods);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(PaymentMethodEntity, builder, paymentMethods);
  }
}
