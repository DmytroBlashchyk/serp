import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SerperDevService } from 'modules/additional-services/services/serper-dev.service';
import { FreeItemsResponse } from 'modules/additional-services/responses/free-items.response';
import { FreeRequest } from 'modules/additional-services/requests/free.request';
import { Top100ItemsResponse } from 'modules/additional-services/responses/top-100-items.response';
import { Top100Request } from 'modules/additional-services/requests/top100.request';
import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';

@Controller('serp-rank-checker')
@ApiTags('SERP Rank Checker')
export class SerpRankCheckerController {
  constructor(private readonly serperDevService: SerperDevService) {}

  /**
   * Handles the POST request to provide free items based on the given request body.
   *
   * @param {FreeRequest} body - The request payload containing details required to get free items.
   * @return {Promise<FreeItemsResponse>} A promise that resolves to the response containing free items.
   */
  @ApiCreatedResponse({ type: FreeItemsResponse })
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post()
  free(@Body() body: FreeRequest) {
    return this.serperDevService.getFreeResults({ ...body });
  }

  /**
   * Retrieves the top 100 free search results based on the specified parameters.
   *
   * @param {DeviceTypesEnum} deviceType - The type of device (e.g., mobile, desktop) for which to retrieve results.
   * @param {IdType} countryId - The identifier of the country for which to retrieve results.
   * @param {string} domainName - The domain name through which the query is being made.
   * @param {string} keyword - The keyword used to perform the search.
   * @param {Top100Request} query - Additional query parameters.
   * @return {Promise<Top100ItemsResponse>} A promise that resolves to the top 100 search results for the specified keyword.
   */
  @ApiOkResponse({ type: Top100ItemsResponse })
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Get(':deviceType/:countryId/:domainName/:keyword')
  getFreeTop100ByKeyword(
    @Param('deviceType') deviceType: DeviceTypesEnum,
    @Param('countryId', new ParseIntPipe()) countryId: IdType,
    @Param('domainName') domainName: string,
    @Param('keyword') keyword: string,
    @Query() query: Top100Request,
  ): Promise<Top100ItemsResponse> {
    return this.serperDevService.getFreeResultsByKeyword(
      {
        deviceType,
        countryId,
        keyword,
        domainName,
      },
      {
        ...query,
      },
    );
  }
}
