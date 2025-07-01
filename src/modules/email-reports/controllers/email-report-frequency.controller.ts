import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { FrequenciesResponse } from 'modules/email-reports/responses/frequencies.response';

@ApiTags('Email Report Frequency')
@Controller('email-report-frequency')
export class EmailReportFrequencyController {
  constructor(private readonly emailReportsService: EmailReportsService) {}

  /**
   * Retrieves all email report frequencies.
   * @return {Promise<FrequenciesResponse>} A promise that resolves to an object containing all email report frequencies.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Get()
  get(): Promise<FrequenciesResponse> {
    return this.emailReportsService.getAllEmailReportFrequency();
  }
}
