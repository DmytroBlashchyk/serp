import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { ReportRecipientEntity } from 'modules/email-reports/entities/report-recipient.entity';
import { EntityRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { EmailReportsRequest } from 'modules/email-reports/requests/email-reports.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortingEmailReportsEnum } from 'modules/email-reports/enums/sorting-email-reports.enum';

@Injectable()
@EntityRepository(ReportRecipientEntity)
export class ReportRecipientRepository extends BaseRepository<ReportRecipientEntity> {
  /**
   * Retrieves a paginated list of email reports for a given account.
   *
   * @param {IdType} accountId - The ID of the account for which to retrieve email reports.
   * @param {EmailReportsRequest} options - The options for retrieving the email reports, which may include search, sort, and pagination parameters.
   * @return {Promise<Pagination<ReportRecipientEntity>>} A promise that resolves to a paginated list of report recipient entities.
   */
  async paginatedEmailReports(
    accountId: IdType,
    options: EmailReportsRequest,
  ): Promise<Pagination<ReportRecipientEntity>> {
    const searchQuery = options.search
      ? `and (project.project_name ILike(:search)) OR (report_recipients.email ILike(:search))`
      : '';

    const queryBuilder = this.createQueryBuilder('report_recipients')
      .leftJoinAndSelect('report_recipients.emailReport', 'emailReport')
      .leftJoinAndSelect('emailReport.project', 'project')
      .leftJoinAndSelect('emailReport.type', 'type')
      .leftJoinAndSelect('emailReport.frequency', 'frequency')
      .leftJoinAndSelect('emailReport.deliveryTime', 'deliveryTime')
      .where(`project.account_id =:accountId ${searchQuery}`, {
        accountId,
        search: options.search ? `%${options.search}%` : '%%',
      });

    if (options.sortBy) {
      queryBuilder.orderBy(
        getKeyByValue(SortingEmailReportsEnum, options.sortBy),
        options.sortOrder,
      );
    } else {
      queryBuilder.orderBy('project.project_name', options.sortOrder);
    }
    return paginate(queryBuilder, { page: options.page, limit: options.limit });
  }
}
