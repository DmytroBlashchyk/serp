import { Body, Controller, Post } from '@nestjs/common';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { EmailReportToPdfRequest } from 'modules/email-reports/requests/email-report-to-pdf.request';
import { DataForPdfResponse } from 'modules/email-reports/responses/data-for-pdf.response';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { KeywordRankingsToPdfRequest } from 'modules/email-reports/requests/keyword-rankings-to-pdf.request';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';

@ApiTags('Email report to pdf')
@Controller('email-report-to-pdf')
export class EmailReportToPdfController {
  constructor(private readonly emailReportsService: EmailReportsService) {}

  /**
   * Creates a report based on the provided request.
   *
   * @param {EmailReportToPdfRequest} body - The request object containing the necessary data for generating the report.
   * @returns {Promise<DataForPdfResponse>} - A promise that resolves to the data required for creating a PDF report.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: DataForPdfResponse })
  @Post()
  create(@Body() body: EmailReportToPdfRequest): Promise<DataForPdfResponse> {
    return this.emailReportsService.getDataForPdf(body.projectId, body.period);
  }

  /**
   * Retrieves keyword rankings for a specific project and generates a response.
   *
   * @param {KeywordRankingsToPdfRequest} body - The request body containing the project ID.
   * @return {Promise<KeywordRankingsResponse>} - A promise that resolves to the keyword rankings response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: KeywordRankingsResponse })
  @Post('keyword-rankings')
  keywordRankings(
    @Body() body: KeywordRankingsToPdfRequest,
  ): Promise<KeywordRankingsResponse> {
    return this.emailReportsService.getKeywordRankings(body.projectId);
  }
}
