import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailReportType } from 'modules/email-reports/types/create-email-report.type';
import { EmailReportFrequencyRepository } from 'modules/email-reports/repositories/email-report-frequency.repository';
import { RetortTypeRepository } from 'modules/email-reports/repositories/retort-type.repository';
import { ReportDeliveryTimeRepository } from 'modules/email-reports/repositories/report-delivery-time.repository';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { EmailReportRepository } from 'modules/email-reports/repositories/email-report.repository';
import { ReportRecipientRepository } from 'modules/email-reports/repositories/report-recipient.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { EmailReportsRequest } from 'modules/email-reports/requests/email-reports.request';
import { EmailReportsRequestFactory } from 'modules/email-reports/factories/email-reports-request.factory';
import { EmailReportsResponse } from 'modules/email-reports/responses/email-reports.response';
import { ReportResponse } from 'modules/email-reports/responses/report.response';
import { UpdateEmailReportType } from 'modules/email-reports/types/update-email-report.type';
import { BulkDeleteRequest } from 'modules/email-reports/requests/bulk-delete.request';
import { FrequenciesResponse } from 'modules/email-reports/responses/frequencies.response';
import { ReportDeliveryTimesResponse } from 'modules/email-reports/responses/report-delivery-times.response';
import { ReportTypesResponse } from 'modules/email-reports/responses/report-types.response';
import { EmailReportFrequencyEnum } from 'modules/email-reports/enums/email-report-frequency.enum';
import { SendCsvEmailReportEvent } from 'modules/email-reports/events/send-csv-email-report.event';
import { EventBus } from '@nestjs/cqrs';
import { CsvService } from 'modules/email-reports/services/csv.service';
import { CsvReportType } from 'modules/email-reports/types/csv-report.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { DataForPdfResponse } from 'modules/email-reports/responses/data-for-pdf.response';
import { ReportTypeEnum } from 'modules/email-reports/enums/report-type.enum';
import { SendPdfEmailReportEvent } from 'modules/email-reports/events/send-pdf-email-report.event';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { ReportDeliveryTimeEntity } from 'modules/email-reports/entities/report-delivery-time.entity';
import { EmailReportFrequencyEntity } from 'modules/email-reports/entities/email-report-frequency.entity';
import { DataForPdfResponseFactory } from 'modules/email-reports/factories/data-for-pdf-response.factory';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class EmailReportsService {
  constructor(
    private readonly emailReportFrequencyRepository: EmailReportFrequencyRepository,
    private readonly retortTypeRepository: RetortTypeRepository,
    private readonly reportDeliveryTimeRepository: ReportDeliveryTimeRepository,
    private readonly projectsService: ProjectsService,
    private readonly emailReportRepository: EmailReportRepository,
    private readonly reportRecipientRepository: ReportRecipientRepository,
    private readonly emailReportsRequestFactory: EmailReportsRequestFactory,
    private readonly eventBus: EventBus,
    private readonly csvService: CsvService,
    private readonly keywordsService: KeywordsService,
    private readonly accountsService: AccountsService,
    private readonly dataForPdfResponseFactory: DataForPdfResponseFactory,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly cliLoggingService: CliLoggingService,
  ) {}

  /**
   * Retrieves keyword rankings for a specified project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<KeywordRankingsResponse>} A promise that resolves to the keyword rankings response.
   */
  async getKeywordRankings(
    projectId: IdType,
  ): Promise<KeywordRankingsResponse> {
    const project = await this.projectsService.getProjectById(projectId);
    return await this.keywordsService.getKeywordRankings(
      { projectId, accountId: project.account.id },
      {
        top3: BooleanEnum.FALSE,
        top10: BooleanEnum.FALSE,
        top30: BooleanEnum.FALSE,
        top100: BooleanEnum.FALSE,
        improved: BooleanEnum.FALSE,
        declined: BooleanEnum.FALSE,
        notRanked: BooleanEnum.FALSE,
        lost: BooleanEnum.FALSE,
        noChange: BooleanEnum.FALSE,
        sortBy: null,
        sortOrder: SortOrderEnum.desc,
        page: 1,
        limit: 1000,
        deviceType: DeviceTypesEnum.DesktopAndMobile,
      },
    );
  }
  /**
   * Retrieves data required for generating a PDF report for a given project and time period.
   *
   * @param {IdType} projectId - The unique identifier for the project.
   * @param {TemporalFiltersEnum} period - The time period for which the data is to be fetched.
   * @return {Promise<DataForPdfResponse>} A promise that resolves to the data required for the PDF.
   */
  @Transactional()
  async getDataForPdf(
    projectId: IdType,
    period: TemporalFiltersEnum,
  ): Promise<DataForPdfResponse> {
    const { projectInfo, brandingInfo, accountSettings } =
      await this.projectsService.getProjectInfoForPdf(projectId);
    const overview = await this.projectsService.projectOverview({
      accountId: accountSettings.id,
      projectId,
      deviceType: projectInfo.deviceType.name as DeviceTypesEnum,
      toDate: projectInfo.updateDate,
      fromDate: projectInfo.previousUpdateDate,
    });
    const improvedVsDeclined = await this.projectsService.improvedVsDeclined({
      accountId: accountSettings.id,
      projectId,
      deviceType: projectInfo.deviceType.name as DeviceTypesEnum,
      declinedFilter: BooleanEnum.TRUE,
      improvedFilter: BooleanEnum.TRUE,
      lostFilter: BooleanEnum.TRUE,
      noChange: BooleanEnum.TRUE,
      period,
    });
    const keywordTrends = await this.projectsService.getKeywordTrends(
      {
        accountId: accountSettings.id,
        projectId,
        deviceType: projectInfo.deviceType.name as DeviceTypesEnum,
        period,
      },
      {
        period,
        deviceType: projectInfo.deviceType.name as DeviceTypesEnum,
        fiftyOneToOneHundred: BooleanEnum.TRUE,
        fromElevenToTwenty: BooleanEnum.TRUE,
        fromTwentyOneToFifty: BooleanEnum.TRUE,
        fromFourToTen: BooleanEnum.TRUE,
        top3Filter: BooleanEnum.TRUE,
        notRanked: BooleanEnum.TRUE,
      },
    );
    const projectPerformance = await this.keywordsService.getProjectPerformance(
      {
        accountId: accountSettings.id,
        projectId: projectInfo.id,
        period,
        competitorIds: projectInfo.competitors.map(
          (competitor) => competitor.id,
        ),
        deviceType: projectInfo.deviceType.name as DeviceTypesEnum,
      },
    );
    return this.dataForPdfResponseFactory.createResponse({
      project: projectInfo,
      overview,
      improvedVsDeclined,
      keywordTrends,
      projectPerformance,
      brandingInfo,
      accountSettings,
    });
  }

  /**
   * Generates an email report in CSV format based on the provided keyword rankings.
   *
   * @param {Array} keywordRanking - An array of objects representing keyword rankings.
   * @return {Promise<string>} A promise that resolves to the generated CSV content as a string.
   */
  async generateEmailReport(keywordRanking: any[]) {
    return this.csvService.generateCsv(keywordRanking);
  }

  /**
   * Sends email reports based on their frequency and type (CSV or PDF).
   * It retrieves the email report IDs by account timezone, fetches
   * the corresponding email reports, updates the next delivery time,
   * and triggers the appropriate event to send the report.
   *
   * @return {Promise<void>} A promise that resolves when the email reports have been processed.
   */
  async sendEmailReport(): Promise<void> {
    try {
      const emailReportIds =
        await this.emailReportRepository.getEmailReportsIdsByAccountTimezone();

      if (emailReportIds.length === 0) {
        return;
      }
      // for testing
      this.cliLoggingService.sendSentryCaptureMessage({
        name: 'Run task sendEmailReport',
        extraData: { emailReportIds },
      });
      const emailReports =
        await this.emailReportRepository.getEmailReportsByIds(
          emailReportIds.map((item) => item.id),
        );

      for (const emailReport of emailReports) {
        const nextDelivery = await this.updateNextDelivery(
          emailReport.frequency,
          emailReport.nextDelivery,
        );

        await this.emailReportRepository.save({ ...emailReport, nextDelivery });

        if (emailReport.type.name === ReportTypeEnum.csv) {
          this.eventBus.publish(
            new SendCsvEmailReportEvent({
              emailReportId: emailReport.id,
              projectId: emailReport.project.id,
              recipients: emailReport.recipients.map(
                (recipient) => recipient.email,
              ),
            }),
          );
        }
        if (emailReport.type.name === ReportTypeEnum.pdf) {
          this.eventBus.publish(
            new SendPdfEmailReportEvent({
              emailReportId: emailReport.id,
              projectId: emailReport.project.id,
              recipients: emailReport.recipients.map(
                (recipient) => recipient.email,
              ),
              period: emailReport.frequency.name,
            }),
          );
        }
      }
    } catch (error) {
      this.cliLoggingService.error('sendEmailReport', error);
    }
  }

  /**
   * Retrieves all available report types from the repository.
   *
   * @return {Promise<ReportTypesResponse>} A promise that resolves to a ReportTypesResponse containing the fetched report types.
   */
  async getAllReportTypes(): Promise<ReportTypesResponse> {
    const reportTypes = await this.retortTypeRepository.find();
    return new ReportTypesResponse({ items: reportTypes });
  }

  /**
   * Retrieves all report delivery times from the repository.
   *
   * @return {Promise<ReportDeliveryTimesResponse>} A promise that resolves to a ReportDeliveryTimesResponse object containing the list of report delivery times.
   */
  async getAllReportDeliveryTimes(): Promise<ReportDeliveryTimesResponse> {
    const reportDeliveryTimes = await this.reportDeliveryTimeRepository.find();
    return new ReportDeliveryTimesResponse({
      items: reportDeliveryTimes,
    });
  }

  /**
   * Retrieves all email report frequencies from the repository.
   *
   * @return {Promise<FrequenciesResponse>} A promise that resolves to a FrequenciesResponse object containing the list of email report frequencies.
   */
  async getAllEmailReportFrequency(): Promise<FrequenciesResponse> {
    const frequency = await this.emailReportFrequencyRepository.find();
    return new FrequenciesResponse({ items: frequency });
  }

  /**
   * Deletes multiple email reports and their associated recipients, and updates the account limits.
   *
   * @param {object} payload - The bulk delete request object containing email report IDs and account ID.
   * @param {Array<string>} payload.emailReportIds - Array of email report identifiers to be deleted.
   * @param {string} payload.accountId - The account identifier associated with the email reports.
   * @return {Promise<void>} A promise that resolves when the email reports and their recipients are deleted, and account limits are updated.
   */
  async bulkDelete(
    payload: BulkDeleteRequest & { accountId: IdType },
  ): Promise<void> {
    const emailReports = await this.emailReportRepository.getEmailReportsByIds(
      payload.emailReportIds,
    );
    const recipients = [];
    for (const emailReport of emailReports) {
      recipients.push(...emailReport.recipients);
    }

    await this.reportRecipientRepository.remove(recipients);
    await this.emailReportRepository.remove(emailReports);
    await this.accountLimitsService.accountingOfEmailReports(
      payload.accountId,
      recipients.length * -1,
    );
  }

  async handleBouncedReportEmail(email: string): Promise<void> {
    const emailReports =
      await this.emailReportRepository.fetchEmailReportsByEmail(email);

    if (!emailReports.length) return;

    for (const emailReport of emailReports) {
      const needFullRemove = emailReport.recipients?.length === 1;
      if (needFullRemove) {
        await this.bulkDelete({
          emailReportIds: [emailReport.id],
          accountId: emailReport.project?.account?.id,
        });
      } else {
        const recipientForDeletion = emailReport.recipients?.find(
          (recipient) => recipient.email === email,
        );

        if (recipientForDeletion?.id) {
          await this.reportRecipientRepository.remove(recipientForDeletion);
        }
      }
    }
  }

  /**
   * Updates an email report based on the provided payload.
   *
   * @param {UpdateEmailReportType} payload - The data necessary to update the email report including emailReportId, accountId, userId, projectId, reportType, frequency, reportDeliveryTimeId, and recipients.
   * @returns {Promise<void>} A promise that resolves when the email report has been successfully updated.
   */
  @Transactional()
  async update(payload: UpdateEmailReportType): Promise<void> {
    const emailReport = await this.emailReportRepository.getEmailReportById(
      payload.emailReportId,
    );
    await this.projectsService.checkAttitudeOfAccount(
      payload.accountId,
      [emailReport.project.id],
      payload.userId,
    );
    if (payload.projectId && payload.projectId != emailReport.project.id) {
      emailReport.project = await this.projectsService.getProjectById(
        payload.projectId,
      );
    }

    if (payload.reportType && payload.reportType !== emailReport.type.name) {
      emailReport.type = await this.retortTypeRepository.getReportTypeByName(
        payload.reportType,
      );
    }

    if (payload.frequency && payload.frequency !== emailReport.frequency.name) {
      emailReport.frequency =
        await this.emailReportFrequencyRepository.getFrequencyByName(
          payload.frequency,
        );
    }

    if (
      payload.reportDeliveryTimeId &&
      payload.reportDeliveryTimeId != emailReport.deliveryTime.id
    ) {
      emailReport.deliveryTime =
        await this.reportDeliveryTimeRepository.getReportDeliveryTime(
          payload.reportDeliveryTimeId,
        );
    }
    emailReport.nextDelivery = await this.determineNextDelivery(
      emailReport.frequency,
      emailReport.deliveryTime,
      payload.accountId,
    );
    if (payload.recipients && payload.recipients.length > 0) {
      const emailsAreIdentical =
        payload.recipients.length === emailReport.recipients.length
          ? emailReport.recipients.every((obj) =>
              payload.recipients.includes(obj.email),
            )
          : false;

      if (!emailsAreIdentical) {
        await this.reportRecipientRepository.remove(emailReport.recipients);
        await this.accountLimitsService.accountingOfEmailReports(
          payload.accountId,
          emailReport.recipients.length * -1,
        );
        delete emailReport.recipients;
        await this.reportRecipientRepository.save(
          payload.recipients.map((recipient) => {
            return {
              email: recipient,
              emailReport,
            };
          }),
        );
      }
    }

    await this.emailReportRepository.save(emailReport);
  }
  /**
   * Retrieves an email report by its ID.
   *
   * @param {IdType} emailReportId - The unique identifier of the email report.
   * @returns {Promise<ReportResponse>} A promise that resolves to the email report details.
   * @throws {NotFoundException} If the email report is not found.
   */
  async getEmailReport(emailReportId: IdType): Promise<ReportResponse> {
    const emailReport = await this.emailReportRepository.getEmailReportById(
      emailReportId,
    );
    if (!emailReport) {
      throw new NotFoundException('Email report not found.');
    }

    return new ReportResponse({
      ...emailReport,
      recipients: emailReport.recipients,
      format: emailReport.type,
    });
  }

  /**
   * Retrieves paginated email reports for the specified account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {EmailReportsRequest} options - The options for retrieving email reports, which includes pagination settings.
   * @return {Promise<EmailReportsResponse>} - A promise that resolves to the email reports response containing the reports and metadata.
   */
  async getEmailReports(
    accountId: IdType,
    options: EmailReportsRequest,
  ): Promise<EmailReportsResponse> {
    const { items, meta } =
      await this.reportRecipientRepository.paginatedEmailReports(
        accountId,
        options,
      );
    return this.emailReportsRequestFactory.createResponse(items, meta);
  }

  /**
   * Determines the next delivery date for an email report based on the given frequency and delivery time.
   *
   * @param {EmailReportFrequencyEntity} frequency - The frequency at which the report is delivered (Daily, Weekly, Monthly).
   * @param {ReportDeliveryTimeEntity} deliveryTime - The specific time of day the report should be delivered.
   * @param {IdType} accountId - The ID of the account for which the next delivery time should be determined.
   * @return {Promise<Date>} - A promise that resolves to the next delivery date and time for the email report.
   */
  async determineNextDelivery(
    frequency: EmailReportFrequencyEntity,
    deliveryTime: ReportDeliveryTimeEntity,
    accountId: IdType,
  ): Promise<Date> {
    let nextDelivery: Date;
    const now = new Date();
    const dateArray = deliveryTime.name.split(':');

    if (frequency.name === EmailReportFrequencyEnum.Daily) {
      const timeString1 = deliveryTime.name;
      const currentAccountTime =
        await this.accountsService.getCurrentTimeOfAccount(accountId);
      const timeString2 = `${currentAccountTime.hours}:${currentAccountTime.minutes}`;

      const time1 = new Date();
      time1.setHours(Number(timeString1.split(':')[0]));
      time1.setMinutes(Number(timeString1.split(':')[1]));

      const time2 = new Date();
      time2.setHours(Number(timeString2.split(':')[0]));
      time2.setMinutes(Number(timeString2.split(':')[1]));

      const differenceInMinutes =
        (time1.getTime() - time2.getTime()) / (1000 * 60);

      if (differenceInMinutes > 0) {
        nextDelivery = new Date();
        nextDelivery.setHours(Number(dateArray[0]));
        nextDelivery.setMinutes(Number(dateArray[1]));
      } else {
        nextDelivery = new Date();
        nextDelivery.setDate(now.getDate() + 1);
        nextDelivery.setHours(Number(dateArray[0]));
        nextDelivery.setMinutes(Number(dateArray[1]));
      }
    } else if (frequency.name === EmailReportFrequencyEnum.Monthly) {
      nextDelivery = new Date();
      nextDelivery.setMonth(now.getMonth() + 1);
      nextDelivery.setHours(Number(dateArray[0]));
      nextDelivery.setMinutes(Number(dateArray[1]));
    } else {
      nextDelivery = new Date();
      nextDelivery.setDate(now.getDate() + 7);
      nextDelivery.setHours(Number(dateArray[0]));
      nextDelivery.setMinutes(Number(dateArray[1]));
    }

    return nextDelivery;
  }

  /**
   * Updates the date for the next email report delivery based on the specified frequency.
   *
   * @param {EmailReportFrequencyEntity} frequency - The frequency at which email reports are sent (e.g., daily, weekly, monthly).
   * @param {Date} previousNextDelivery - The current scheduled date for the next email report.
   * @return {Promise<Date>} The updated date for the next email report delivery.
   */
  async updateNextDelivery(
    frequency: EmailReportFrequencyEntity,
    previousNextDelivery: Date,
  ): Promise<Date> {
    const nextDelivery = new Date(previousNextDelivery);

    if (frequency.name === EmailReportFrequencyEnum.Daily) {
      nextDelivery.setDate(nextDelivery.getDate() + 1);
    } else if (frequency.name === EmailReportFrequencyEnum.Monthly) {
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    } else {
      nextDelivery.setDate(nextDelivery.getDate() + 7);
    }

    return nextDelivery;
  }

  /**
   * Creates an email report based on the given payload.
   *
   * @param {CreateEmailReportType} payload - The payload containing information needed to create an email report.
   * @param {number} payload.accountId - The ID of the account for which the report is being created.
   * @param {number} payload.projectId - The ID of the project associated with the report.
   * @param {number} payload.userId - The ID of the user requesting the creation of the report.
   * @param {string} payload.frequency - The frequency at which the report should be sent.
   * @param {string} payload.reportType - The type of report to be generated.
   * @param {number} payload.reportDeliveryTimeId - The ID representing the report delivery time.
   * @param {Array<string>} payload.recipients - A list of email addresses to whom the report will be sent.
   *
   * @return {Promise<void>} A promise that resolves when the email report has been successfully created.
   */
  async create(payload: CreateEmailReportType): Promise<void> {
    await this.projectsService.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const project = await this.projectsService.getProjectById(
      payload.projectId,
    );
    const frequency =
      await this.emailReportFrequencyRepository.getFrequencyByName(
        payload.frequency,
      );
    const type = await this.retortTypeRepository.getReportTypeByName(
      payload.reportType,
    );

    const deliveryTime =
      await this.reportDeliveryTimeRepository.getReportDeliveryTime(
        payload.reportDeliveryTimeId,
      );

    const nextDelivery = await this.determineNextDelivery(
      frequency,
      deliveryTime,
      payload.accountId,
    );
    const emailReport = await this.emailReportRepository.save({
      project,
      type,
      deliveryTime,
      frequency,
      nextDelivery,
    });
    await this.reportRecipientRepository.save(
      payload.recipients.map((recipient) => {
        return {
          email: recipient,
          emailReport,
        };
      }),
    );
    await this.accountLimitsService.accountingOfEmailReports(
      payload.accountId,
      payload.recipients.length,
    );
  }
}
