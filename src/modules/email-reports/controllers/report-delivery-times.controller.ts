import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EmailReportsService } from 'modules/email-reports/services/email-reports.service';
import { ReportDeliveryTimesResponse } from 'modules/email-reports/responses/report-delivery-times.response';

@ApiTags('Report Delivery Times')
@Controller('accounts')
export class ReportDeliveryTimesController {
  constructor(private readonly emailReportsService: EmailReportsService) {}

  /**
   * Retrieves all report delivery times.
   *
   * @return {Promise<ReportDeliveryTimesResponse>} A promise that resolves to an instance
   * of ReportDeliveryTimesResponse containing the delivery times of all reports.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ReportDeliveryTimesResponse })
  @Get(':id/report-delivery-times')
  get(): Promise<ReportDeliveryTimesResponse> {
    return this.emailReportsService.getAllReportDeliveryTimes();
  }
}
