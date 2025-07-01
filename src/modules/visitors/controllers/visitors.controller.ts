import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param } from '@nestjs/common';
import { VisitorsService } from 'modules/visitors/services/visitors.service';
import { VisitorRequest } from 'modules/visitors/requests/visitor.request';
import { VisitorRequestsLimitResponse } from 'modules/visitors/responses/visitor-requests-limit.response';

@ApiTags('Visitors')
@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  /**
   * This method retrieves the request limit for a visitor based on their IP address.
   *
   * @param {VisitorRequest} params - The parameters containing the IP address of the visitor.
   * @return {Promise<VisitorRequestsLimitResponse>} - A promise resolving to the visitor's request limit response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: VisitorRequestsLimitResponse })
  @Get('/:ipAddress')
  getVisitorRequestsLimit(
    @Param() params: VisitorRequest,
  ): Promise<VisitorRequestsLimitResponse> {
    return this.visitorsService.getVisitorRequestsLimitByIpAddress(
      params.ipAddress,
    );
  }
}
