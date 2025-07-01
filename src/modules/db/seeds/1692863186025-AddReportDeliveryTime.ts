import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { ReportDeliveryTimeEntity } from 'modules/email-reports/entities/report-delivery-time.entity';
import { reportDeliveryTimes } from 'modules/db/seeds/data/1692863186025-AddReportDeliveryTime/reportDeliveryTimes';

export class AddReportDeliveryTime1692863186025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(ReportDeliveryTimeEntity, builder, reportDeliveryTimes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(
      ReportDeliveryTimeEntity,
      builder,
      reportDeliveryTimes,
    );
  }
}
