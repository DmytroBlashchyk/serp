import { Controller, Get, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LanguagesService } from 'modules/languages/services/languages.service';
import { LanguagesResponse } from 'modules/languages/responses/languages.response';

@Controller('languages')
@ApiTags('Languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  /**
   * Retrieves all available languages from the languages service.
   *
   * @return {Promise<LanguagesResponse>} A promise that resolves to the response containing all available languages.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LanguagesResponse })
  @Get()
  getAll(): Promise<LanguagesResponse> {
    return this.languagesService.getAll();
  }

  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LanguagesResponse })
  @Get('bing')
  getAllForBing(): Promise<LanguagesResponse> {
    return this.languagesService.getAllForBing();
  }

  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LanguagesResponse })
  @Get('youtube')
  getAllForYoutube(): Promise<LanguagesResponse> {
    return this.languagesService.getAllForYoutube();
  }

  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LanguagesResponse })
  @Get('yahoo')
  getAllForYahoo(): Promise<LanguagesResponse> {
    return this.languagesService.getAllForYahoo();
  }

  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LanguagesResponse })
  @Get('baidu')
  getAllForBaidu(): Promise<LanguagesResponse> {
    return this.languagesService.getAllForBaidu();
  }
}
