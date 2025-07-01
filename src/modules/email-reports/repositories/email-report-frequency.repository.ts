import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { EmailReportFrequencyEntity } from 'modules/email-reports/entities/email-report-frequency.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';

@Injectable()
@EntityRepository(EmailReportFrequencyEntity)
export class EmailReportFrequencyRepository extends BaseRepository<EmailReportFrequencyEntity> {
  /**
   * Retrieves the frequency entity based on the provided frequency name.
   *
   * @param {EmailReportFrequencyEnum} name - The name of the email report frequency to retrieve.
   * @return {Promise<EmailReportFrequencyEntity>} A promise that resolves to the matching frequency entity.
   */
  async getFrequencyByName(
    name: EmailReportFrequencyEnum,
  ): Promise<EmailReportFrequencyEntity> {
    return this.findOne({ where: { name } });
  }
}
