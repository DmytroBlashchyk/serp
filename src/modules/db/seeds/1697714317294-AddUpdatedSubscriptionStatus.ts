import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';

export class AddUpdatedSubscriptionStatus1697714317294
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(SubscriptionStatusEntity, builder, [
      { name: 'updated' },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(SubscriptionStatusEntity, builder, [
      { name: 'updated' },
    ]);
  }
}
