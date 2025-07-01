import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { GoogleDomainsService } from 'modules/google-domains/services/google-domains.service';
import { GoogleDomainsResponse } from 'modules/google-domains/responses/google-domains.response';

@ApiTags('Google domains')
@Controller('google-domains')
export class GoogleDomainsController {
  constructor(private readonly googleDomainsService: GoogleDomainsService) {}

  /**
   * Fetches a list of all Google domains.
   *
   * @return {Promise<GoogleDomainsResponse>} A promise that resolves to a response containing all Google domains.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: GoogleDomainsResponse })
  @Get()
  async getAllGoogleDomains(): Promise<GoogleDomainsResponse> {
    return this.googleDomainsService.getAll();
  }
}
