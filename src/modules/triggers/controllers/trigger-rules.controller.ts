import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { TriggerRulesService } from 'modules/triggers/services/trigger-rules.service';
import { TriggerRulesResponse } from 'modules/triggers/responses/trigger-rules.response';

@Controller('trigger-rules')
@ApiTags('Trigger Rules')
export class TriggerRulesController {
  constructor(private readonly triggerRulesService: TriggerRulesService) {}

  /**
   * Retrieves all trigger rules.
   *
   * @return {Promise<TriggerRulesResponse>} A promise that resolves to a TriggerRulesResponse object containing all trigger rules.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: TriggerRulesResponse })
  @Get()
  get(): Promise<TriggerRulesResponse> {
    return this.triggerRulesService.getAllTriggerRules();
  }
}
