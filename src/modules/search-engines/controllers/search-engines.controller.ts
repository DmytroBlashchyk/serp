import { Controller, Get } from '@nestjs/common';
import { SearchEnginesService } from 'modules/search-engines/services/search-engines.service';
import { SearchEnginesResponse } from 'modules/search-engines/responses/search-engines.response';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Search Engines')
@Controller('search-engines')
export class SearchEnginesController {
  constructor(private readonly searchEnginesService: SearchEnginesService) {}

  /**
   * Fetches all search engines data.
   *
   * @return {Promise<SearchEnginesResponse>} A promise that resolves to the response containing all search engines data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: SearchEnginesResponse })
  @Get()
  getAll(): Promise<SearchEnginesResponse> {
    return this.searchEnginesService.getAll();
  }
}
