import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';
import { subscriptionStatuses } from 'modules/db/seeds/data/1696844318188-AddSubscriptionStatuses/subscriptionStatuses';

export class AddSubscriptionStatuses1696844318188
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(
      SubscriptionStatusEntity,
      builder,
      subscriptionStatuses,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(
      SubscriptionStatusEntity,
      builder,
      subscriptionStatuses,
    );
  }
}
