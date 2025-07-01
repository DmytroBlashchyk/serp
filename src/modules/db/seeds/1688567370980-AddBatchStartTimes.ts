import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { batchStartTimes } from 'modules/db/seeds/data/1688567370980-AddBatchStartTimes/batchStartTimes';
import { BatchStartPeriodEntity } from 'modules/batches/entities/batch-start-period.entity';

export class AddBatchStartTimes1688567370980 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(BatchStartPeriodEntity, builder, batchStartTimes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(BatchStartPeriodEntity, builder, batchStartTimes);
  }
}
