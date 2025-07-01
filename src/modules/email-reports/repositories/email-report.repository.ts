import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { EmailReportEntity } from 'modules/email-reports/entities/email-report.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(EmailReportEntity)
export class EmailReportRepository extends BaseRepository<EmailReportEntity> {
  /**
   * Retrieves the IDs of email reports based on the account's timezone.
   * This method compares the current time with the scheduled next delivery time
   * of the email reports, adjusted according to the respective account's timezone.
   *
   * @return {Promise<EmailReportEntity[]>} A promise that resolves to an array of EmailReportEntity objects.
   */
  async getEmailReportsIdsByAccountTimezone(): Promise<EmailReportEntity[]> {
    return this.query(
      `
SELECT
    email_reports.id
FROM email_reports
JOIN projects ON email_reports.project_id = projects.id
JOIN accounts ON projects.account_id = accounts.id
JOIN timezones ON accounts.timezone_id = timezones.id
WHERE (
        (EXTRACT(HOUR FROM NOW() AT TIME ZONE timezones.tz_code) = EXTRACT(HOUR FROM email_reports.next_delivery AT TIME ZONE 'UTC')
        AND EXTRACT(MINUTE FROM NOW() AT TIME ZONE timezones.tz_code) = EXTRACT(MINUTE FROM email_reports.next_delivery AT TIME ZONE 'UTC'))
    OR
        (DATE(NOW() AT TIME ZONE timezones.tz_code) > DATE(email_reports.next_delivery AT TIME ZONE 'UTC'))
    )
    AND DATE(NOW() AT TIME ZONE timezones.tz_code) >= DATE(email_reports.next_delivery AT TIME ZONE 'UTC');
`,
      [],
    );
  }

  /**
   * Retrieves email reports from the database based on the provided array of report IDs.
   *
   * @param {IdType[]} ids - An array of identifiers for the email reports to be retrieved.
   * @return {Promise<EmailReportEntity[]>} A promise that resolves to an array of email report entities.
   */
  async getEmailReportsByIds(ids: IdType[]): Promise<EmailReportEntity[]> {
    return this.createQueryBuilder('email_reports')
      .leftJoinAndSelect('email_reports.recipients', 'recipients')
      .leftJoinAndSelect('email_reports.type', 'type')
      .leftJoinAndSelect('email_reports.project', 'project')
      .leftJoinAndSelect('email_reports.frequency', 'frequency')
      .leftJoinAndSelect('email_reports.deliveryTime', 'deliveryTime')
      .where('email_reports.id in(:...ids)', { ids })
      .getMany();
  }
  /**
   * Fetches an EmailReportEntity by its ID.
   *
   * @param {IdType} emailReportId - The unique identifier of the email report.
   *
   * @return {Promise<EmailReportEntity>} A promise that resolves with the EmailReportEntity corresponding to the provided ID.
   */
  async getEmailReportById(emailReportId: IdType): Promise<EmailReportEntity> {
    return this.createQueryBuilder('email_reports')
      .withDeleted()
      .leftJoinAndSelect('email_reports.type', 'type')
      .leftJoinAndSelect('email_reports.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('account.timezone', 'timezone')
      .leftJoinAndSelect('email_reports.recipients', 'recipients')
      .leftJoinAndSelect('email_reports.frequency', 'frequency')
      .leftJoinAndSelect('email_reports.deliveryTime', 'deliveryTime')
      .where('email_reports.id =:emailReportId', { emailReportId })
      .getOne();
  }

  /**
   * Fetches an EmailReportEntity by its email.
   *
   * @param {string} email - The email report.
   *
   * @return {Promise<EmailReportEntity[]>} A promise that resolves with the EmailReportEntity[] corresponding to the provided email.
   */
  async fetchEmailReportsByEmail(email: string): Promise<EmailReportEntity[]> {
    return this.createQueryBuilder('email_reports')
      .withDeleted()
      .leftJoinAndSelect('email_reports.type', 'type')
      .leftJoinAndSelect('email_reports.project', 'project')
      .leftJoinAndSelect('project.account', 'account')
      .leftJoinAndSelect('account.timezone', 'timezone')
      .leftJoinAndSelect('email_reports.recipients', 'recipients')
      .leftJoinAndSelect('email_reports.frequency', 'frequency')
      .leftJoinAndSelect('email_reports.deliveryTime', 'deliveryTime')
      .where('recipients.email =:email', { email })
      .getMany();
  }
}
