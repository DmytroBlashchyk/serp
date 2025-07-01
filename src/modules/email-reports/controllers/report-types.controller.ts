import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { ReportTypesResponse } from 'modules/email-reports/responses/report-types.response';

@ApiTags('Report types')
@Controller('report-types')
export class ReportTypesController {
  constructor(private readonly emailReportsService: EmailReportsService) {}

  /**
   * Retrieves all report types available in the email reports service.
   *
   * @return {Promise<ReportTypesResponse>} A promise that resolves to a ReportTypesResponse object containing the report types data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ReportTypesResponse })
  @Get()
  get(): Promise<ReportTypesResponse> {
    return this.emailReportsService.getAllReportTypes();
  }
}
