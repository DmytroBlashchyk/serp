import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { SubscriptionStatusEntity } from 'modules/subscriptions/entities/subscription-status.entity';

export class AddDeactivatedSubscriptionStatus1714484503826
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(SubscriptionStatusEntity, builder, [
      { name: 'deactivated' },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(SubscriptionStatusEntity, builder, [
      { name: 'deactivated' },
    ]);
  }
}
