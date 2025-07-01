import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { TriggerTypesService } from 'modules/triggers/services/trigger-types.service';
import { TriggerTypesResponse } from 'modules/triggers/responses/trigger-types.response';

@Controller('trigger-types')
@ApiTags('Trigger  Types')
export class TriggerTypesController {
  constructor(private readonly triggerTypes: TriggerTypesService) {}

  /**
   * Handles HTTP GET requests to retrieve all trigger types.
   *
   * @return {Promise<TriggerTypesResponse>} A promise that resolves to a response containing all trigger types.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: TriggerTypesResponse })
  @Get()
  get(): Promise<TriggerTypesResponse> {
    return this.triggerTypes.getAllTriggerTypes();
  }
}
