import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { EmailReportsResponse } from 'modules/email-reports/responses/email-reports.response';
import { Injectable } from '@nestjs/common';
import { ReportRecipientEntity } from 'modules/email-reports/entities/report-recipient.entity';
import { EmailReportResponse } from 'modules/email-reports/responses/email-report.response';
import { FrequencyResponse } from 'modules/email-reports/responses/frequency.response';
import { FormatResponse } from 'modules/email-reports/responses/format.response';
import moment from 'moment';

import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { dateHelper } from 'modules/common/utils/dateHelper';

@Injectable()
export class EmailReportsRequestFactory extends BaseResponseFactory<
  ReportRecipientEntity[],
  EmailReportsResponse
> {
  /**
   * Creates a response object for email reports.
   *
   * @param {ReportRecipientEntity[]} entity - Array of report recipient entities.
   * @param {Record<string, unknown>} [options] - Optional additional options.
   * @return {Promise<EmailReportsResponse> | EmailReportsResponse} - The email reports response.
   */
  createResponse(
    entity: ReportRecipientEntity[],
    options?: Record<string, unknown>,
  ): Promise<EmailReportsResponse> | EmailReportsResponse {
    return new EmailReportsResponse({
      items: entity.map((item) => {
        return new EmailReportResponse({
          id: item.emailReport.id,
          project: item.emailReport.project.projectName,
          frequency: new FrequencyResponse({ ...item.emailReport.frequency }),
          lastSent: item.emailReport.lastSent
            ? dateHelper(item.emailReport.lastSent)
            : '',
          lastSentFullFormat: item.emailReport.lastSent
            ? formatGoogleStyleDate(item.emailReport.lastSent)
            : '',
          nextDelivery: moment(item.emailReport.nextDelivery).format(
            'MMM D, YYYY HH:mm',
          ),
          format: new FormatResponse(item.emailReport.type),
          recipient: item.email,
        });
      }),
      meta: options,
    });
  }
}
