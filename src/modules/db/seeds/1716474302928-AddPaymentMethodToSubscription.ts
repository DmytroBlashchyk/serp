import { MigrationInterface, QueryRunner } from 'typeorm';
import { SubscriptionEntity } from 'modules/subscriptions/entities/subscription.entity';
import { PaymentMethodEntity } from 'modules/payments/entities/payment-method.entity';

export class AddPaymentMethodToSubscription1716474302928
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const repository = queryRunner.manager.getRepository(SubscriptionEntity);
    const subscriptions = await repository
      .createQueryBuilder('subscriptions')
      .where('payment_method_id is null and card_id is not null')
      .getMany();
    const paymentMethod = await queryRunner.manager.findOne(
      PaymentMethodEntity,
      {
        where: { name: 'card' },
      },
    );
    for (const subscription of subscriptions) {
      await queryRunner.manager.save(SubscriptionEntity, {
        ...subscription,
        paymentMethod,
      });
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
