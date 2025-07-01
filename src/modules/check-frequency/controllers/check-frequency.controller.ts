import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { CheckFrequencyService } from 'modules/check-frequency/services/check-frequency.service';
import { CheckFrequenciesResponse } from 'modules/check-frequency/responses/check-frequencies.response';

@Controller('check-frequency')
@ApiTags('Check Frequency')
export class CheckFrequencyController {
  constructor(private readonly checkFrequencyService: CheckFrequencyService) {}

  /**
   * Retrieves all check frequencies from the service.
   *
   * @return {Promise<CheckFrequenciesResponse>} A promise that resolves to an object containing all check frequencies.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: CheckFrequenciesResponse })
  @Get()
  getAll(): Promise<CheckFrequenciesResponse> {
    return this.checkFrequencyService.getAll();
  }
}
