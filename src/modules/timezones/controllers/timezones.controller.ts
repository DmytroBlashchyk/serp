import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TimezonesService } from 'modules/timezones/services/timezones.service';
import { TimezonesResponse } from 'modules/timezones/responses/timezones.response';

@Controller('timezones')
@ApiTags('Timezones')
export class TimezonesController {
  constructor(private readonly timezonesService: TimezonesService) {}

  /**
   * Retrieves all available timezones.
   *
   * @return {Promise<TimezonesResponse>} A promise that resolves to a TimezonesResponse object containing the list of timezones.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: TimezonesResponse })
  @Get()
  getAllTimezones(): Promise<TimezonesResponse> {
    return this.timezonesService.getAllTimezones();
  }
}
