import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';

export class AddCanceledSubscriptionStatus1697452505909
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(SubscriptionStatusEntity, builder, [
      { name: 'canceled' },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(SubscriptionStatusEntity, builder, [
      { name: 'canceled' },
    ]);
  }
}
