import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { BatchStartPeriodEntity } from 'modules/batches/entities/batch-start-period.entity';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';

export class AddNowPeriod1689317612586 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(BatchStartPeriodEntity, builder, [{ name: 'now' }]);
    const builder2 = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(CheckFrequencyEntity, builder2, [{ name: 'Now' }]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(BatchStartPeriodEntity, builder, [{ name: 'now' }]);
    const builder2 = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(CheckFrequencyEntity, builder2, [{ name: 'Now' }]);
  }
}
