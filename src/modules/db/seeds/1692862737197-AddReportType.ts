import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { ReportTypeEntity } from 'modules/email-reports/entities/report-type.entity';
import { reportTypes } from 'modules/db/seeds/data/1692862737197-AddReportType/reportTypes';

export class AddReportType1692862737197 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(ReportTypeEntity, builder, reportTypes);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(ReportTypeEntity, builder, reportTypes);
  }
}
