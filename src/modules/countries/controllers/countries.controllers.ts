import { Controller, Get, Post, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CountriesService } from 'modules/countries/services/countries.service';
import { CountriesResponse } from 'modules/countries/responses/countries.response';
import { SearchLocationsRequest } from 'modules/countries/requests/search-locations.request';
import { LocationsService } from 'modules/countries/services/locations.service';
import { LocationsResponse } from 'modules/countries/responses/locations.response';

@Controller('countries')
@ApiTags('Countries')
export class CountriesControllers {
  constructor(
    private readonly countriesService: CountriesService,
    private readonly locationsService: LocationsService,
  ) {}

  /**
   * Retrieves a list of all available countries.
   *
   * @return {Promise<CountriesResponse>} A promise that resolves to an object containing the list of countries.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: CountriesResponse })
  @Get()
  async getAllCountries(): Promise<CountriesResponse> {
    return this.countriesService.getAllCountries();
  }

  /**
   * Searches for locations based on the provided query parameters.
   *
   * @param {SearchLocationsRequest} query - The query parameters for searching locations.
   * @return {Promise<LocationsResponse>} - A promise that resolves to a LocationsResponse containing the search results.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LocationsResponse })
  @Get('locations')
  async searchLocationsForGoogle(
    @Query() query: SearchLocationsRequest,
  ): Promise<LocationsResponse> {
    return this.locationsService.getLocationsForGoogle(
      {
        ...query,
      },
      query.search,
    );
  }

  /**
   * Searches for locations using the Bing API.
   *
   * @param {SearchLocationsRequest} query - The request object containing search parameters.
   * @return {Promise<LocationsResponse>} A promise that resolves to the locations response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LocationsResponse })
  @Get('locations/bing')
  async searchLocationsForBing(
    @Query() query: SearchLocationsRequest,
  ): Promise<LocationsResponse> {
    return this.locationsService.getLocationsForBing(
      {
        ...query,
      },
      query.search,
    );
  }

  /**
   * Searches for locations associated with YouTube based on the specified query parameters.
   *
   * @param {SearchLocationsRequest} query - The search query containing parameters for filtering YouTube locations.
   * @return {Promise<LocationsResponse>} - A promise that resolves to the response containing the list of locations matching the search criteria.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LocationsResponse })
  @Get('locations/youtube')
  async searchLocationsForYoutube(
    @Query() query: SearchLocationsRequest,
  ): Promise<LocationsResponse> {
    return this.locationsService.getLocationsForYoutube(
      {
        ...query,
      },
      query.search,
    );
  }

  /**
   * Searches locations using the Yahoo API based on the given query parameters.
   *
   * @param {SearchLocationsRequest} query - The search criteria and parameters for querying locations.
   * @return {Promise<LocationsResponse>} - A promise that resolves to a response containing location data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LocationsResponse })
  @Get('locations/yahoo')
  async searchLocationsForYahoo(
    @Query() query: SearchLocationsRequest,
  ): Promise<LocationsResponse> {
    return this.locationsService.getLocationsForYahoo(
      {
        ...query,
      },
      query.search,
    );
  }

  /**
   * Searches for locations using the Baidu API based on the provided query parameters.
   *
   * @param {SearchLocationsRequest} query - The query parameters for searching locations on Baidu.
   *                                          This includes the search string and any additional filters.
   * @return {Promise<LocationsResponse>} - A promise that resolves to a LocationsResponse object,
   *                                        which contains the search results.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LocationsResponse })
  @Get('locations/baidu')
  async searchLocationsForBaidu(
    @Query() query: SearchLocationsRequest,
  ): Promise<LocationsResponse> {
    return this.locationsService.getLocationsForBaidu(
      {
        ...query,
      },
      query.search,
    );
  }
}
