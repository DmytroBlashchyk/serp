import { MigrationInterface, QueryRunner } from 'typeorm';
import { applySeedEnum } from 'modules/db/utils/applySeedEnum';
import { revertSeedEnum } from 'modules/db/utils/revertSeedEnum';
import { emailReportFrequency } from 'modules/db/seeds/data/1692865176385-AddEmailReportFrequency/emailReportFrequency';
import { EmailReportFrequencyEntity } from 'modules/email-reports/entities/email-report-frequency.entity';

export class AddEmailReportFrequency1692865176385
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await applySeedEnum(
      EmailReportFrequencyEntity,
      builder,
      emailReportFrequency,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const builder = await queryRunner.manager.createQueryBuilder();
    await revertSeedEnum(
      EmailReportFrequencyEntity,
      builder,
      emailReportFrequency,
    );
  }
}
