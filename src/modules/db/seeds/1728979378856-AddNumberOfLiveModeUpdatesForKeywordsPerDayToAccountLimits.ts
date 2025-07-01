import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { LimitTypeEntity } from 'modules/account-limits/entities/limit-type.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';

export class AddNumberOfLiveModeUpdatesForKeywordsPerDayToAccountLimits1728979378856
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(LimitTypeEntity, builder, [
      { name: 'Number of live mode updates for keywords per day' },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(LimitTypeEntity, builder, [
      { name: 'Number of live mode updates for keywords per day' },
    ]);
  }
}
