import { Injectable } from '@nestjs/common';
import { FreeItemsResponse } from 'modules/additional-services/responses/free-items.response';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { RedisCacheService } from 'modules/cache/services/redis-cache.service';
import { FreeType } from 'modules/additional-services/types/free.type';
import { CountriesService } from 'modules/countries/services/countries.service';
import { SerperDevResultType } from 'modules/additional-services/types/serper-dev-result.type';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { VisitorsService } from 'modules/visitors/services/visitors.service';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { GetFreeTop100ByKeywordType } from 'modules/additional-services/types/get-free-top-100-by-keyword.type';
import { Top100ItemsResponse } from 'modules/additional-services/responses/top-100-items.response';
import { PaginationMetaType } from 'modules/common/responses/pagination.response';
import { Top100Response } from 'modules/additional-services/responses/top-100.response';
import { extractDomain } from 'modules/additional-services/helpers/extractDomain.helper';
import { cutLine } from 'modules/common/decorators/is-valid-real-domain.decorator';
import { Transactional } from 'typeorm-transactional-cls-hooked';

@Injectable()
export class SerperDevService {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisCacheService: RedisCacheService,
    private readonly countriesService: CountriesService,
    private readonly visitorsService: VisitorsService,
  ) {}

  /**
   * Checks if the provided hostname is a real domain by attempting to parse it.
   *
   * @param {string} hostname - The hostname to check if it's a real domain.
   * @return {Promise<string>} A promise that resolves to the parsed hostname if valid, otherwise null.
   */
  async isRealDomain(hostname: string): Promise<string> {
    try {
      const parsedUrl = new URL(hostname);
      return parsedUrl.hostname;
    } catch (error) {
      return null;
    }
  }
  /**
   * Retrieves free search results based on the given payload, which includes domain name,
   * IP address, country ID, device type, and keywords. It also updates visitor's daily requests
   * and retrieves search data from cache or a search service.
   *
   * @param {FreeType} payload - The payload containing the search request details including:
   *   - ipAddress: The IP address of the visitor.
   *   - domainName: The domain name being searched.
   *   - countryId: The ID of the country for the search.
   *   - deviceType: The type of device being used for the search.
   *   - keywords: An array of keywords to search for.
   *   - competitorDomains: (Optional) An array of competitor domain names.
   *
   * @return {Promise<FreeItemsResponse>} A promise that resolves to a response containing:
   *   - items: An array of search results with positions for the given domain and competitors.
   *   - freeRequestsLimit: The remaining free requests limit for the day.
   */
  @Transactional()
  async getFreeResults(payload: FreeType) {
    const visitor = await this.visitorsService.getVisitorByIpAddress(
      payload.ipAddress,
    );

    const domainName = cutLine(payload.domainName);
    let numberOfValidRequests = 10;
    if (visitor) {
      await this.visitorsService.checkVisitorDailyRequests(visitor);
      numberOfValidRequests =
        numberOfValidRequests - visitor.numberOfDailyRequests;
    }
    const keywords = payload.keywords.slice(0, numberOfValidRequests);
    const updatedVisitor =
      await this.visitorsService.updateVisitorDailyRequests(
        visitor,
        payload.ipAddress,
        keywords.length,
      );

    const country = await this.countriesService.getExistingCountry(
      payload.countryId,
    );
    const data = [];
    for (const keyword of keywords) {
      const key = `domain_${domainName}_device_${payload.deviceType.toLowerCase()}_country_${country.code.toLowerCase()}_keyword_${keyword.replace(
        / /g,
        '_',
      )}`;
      const result = (await this.redisCacheService.get(
        key,
      )) as SerperDevResultType[];
      if (result) {
        data.push({
          domainName: extractDomain(domainName),
          keyword: keyword,
          yourPosition: await this.findPosition(result, domainName),
          firstCompetitor:
            payload?.competitorDomains && payload?.competitorDomains.length > 0
              ? payload?.competitorDomains[0]
              : '',
          firstMoverPosition:
            payload?.competitorDomains && payload?.competitorDomains.length > 0
              ? await this.findPosition(result, payload?.competitorDomains[0])
              : 0,
          secondCompetitor:
            payload?.competitorDomains && payload?.competitorDomains.length > 1
              ? payload?.competitorDomains[1]
              : '',
          secondMoverPosition:
            payload?.competitorDomains && payload?.competitorDomains.length > 1
              ? await this.findPosition(result, payload?.competitorDomains[1])
              : 0,
          thirdCompetitor:
            payload?.competitorDomains && payload?.competitorDomains.length > 2
              ? payload?.competitorDomains[2]
              : '',
          thirdPartyPosition:
            payload?.competitorDomains && payload?.competitorDomains.length > 2
              ? await this.findPosition(result, payload?.competitorDomains[2])
              : 0,
        });
      } else {
        const result = await this.search(
          keyword,
          country.code.toLowerCase(),
          payload.deviceType,
        );
        await this.redisCacheService.set(key, result.organic, 1500);
        data.push({
          domainName: extractDomain(domainName),
          keyword: keyword,
          yourPosition: await this.findPosition(result.organic, domainName),
          firstCompetitor:
            payload?.competitorDomains && payload?.competitorDomains.length > 0
              ? payload?.competitorDomains[0]
              : '',
          firstMoverPosition:
            payload?.competitorDomains && payload?.competitorDomains.length > 0
              ? await this.findPosition(
                  result.organic,
                  payload?.competitorDomains[0],
                )
              : 0,
          secondCompetitor:
            payload?.competitorDomains && payload?.competitorDomains.length > 1
              ? payload?.competitorDomains[1]
              : '',
          secondMoverPosition:
            payload?.competitorDomains && payload?.competitorDomains.length > 1
              ? await this.findPosition(
                  result.organic,
                  payload?.competitorDomains[1],
                )
              : 0,
          thirdCompetitor:
            payload?.competitorDomains && payload?.competitorDomains.length > 2
              ? payload?.competitorDomains[2]
              : '',
          thirdPartyPosition:
            payload?.competitorDomains && payload?.competitorDomains.length > 2
              ? await this.findPosition(
                  result.organic,
                  payload?.competitorDomains[2],
                )
              : 0,
        });
      }
    }

    const freeRequestsLimit =
      this.configService.get(
        ConfigEnvEnum.FREE_REQUESTS_LIMIT_FOR_SERP_RANK_CHECKER,
      ) - Number(updatedVisitor.numberOfDailyRequests);

    return new FreeItemsResponse({
      items: data,
      freeRequestsLimit: freeRequestsLimit,
    });
  }

  /**
   * Finds the position of a given domain within the provided data array.
   *
   * @param {SerperDevResultType[]} data - The array containing result objects to search through.
   * @param {string} domain - The domain name to find in the data array.
   * @return {Promise<number>} - A Promise that resolves to the position of the domain in the array, or null if not found.
   */
  private async findPosition(
    data: SerperDevResultType[],
    domain: string,
  ): Promise<number> {
    for (const item of data) {
      const domainName = await this.isRealDomain(item.link);
      if (domainName === cutLine(domain) || domainName === `www.${domain}`) {
        return item.position;
      }
    }
    return null;
  }

  /**
   * Searches for the provided keyword using the specified country code and device type.
   *
   * @param {string} keyword - The keyword to search for.
   * @param {string} countryCode - The country code to use for the search.
   * @param {DeviceTypesEnum} device - The device type to use for the search.
   * @return {Promise<Object>} A promise that resolves to the search results data.
   */
  async search(keyword: string, countryCode: string, device: DeviceTypesEnum) {
    const data = JSON.stringify({
      q: keyword,
      gl: countryCode,
      device: device.toLowerCase(),
      num: this.configService.get(
        ConfigEnvEnum.SERPER_SEARCH_NUMBER_OF_RESULTS,
      ),
    });
    try {
      const response = await axios.post(
        'https://google.serper.dev/search',
        data,
        {
          headers: {
            'X-API-KEY': this.configService.get(ConfigEnvEnum.SERPER_API_KEY),
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch event types: ${error.message}`);
    }
  }

  /**
   * Retrieves free search results based on a given keyword, country, and device type.
   *
   * @param {GetFreeTop100ByKeywordType} payload - The payload containing the search parameters, including countryId, domainName, deviceType, and keyword.
   * @param {PaginatedQueryRequest} options - The pagination options including page number and limit of items per page.
   * @return {Promise<Top100ItemsResponse>} - Returns a promise that resolves to the top 100 search results response with pagination metadata.
   */
  async getFreeResultsByKeyword(
    payload: GetFreeTop100ByKeywordType,
    options: PaginatedQueryRequest,
  ): Promise<Top100ItemsResponse> {
    const country = await this.countriesService.getExistingCountry(
      payload.countryId,
    );
    let data = [] as Top100Response[];
    const domainName = cutLine(payload.domainName);
    const key = `domain_${domainName}_device_${payload.deviceType.toLowerCase()}_country_${country.code.toLowerCase()}_keyword_${payload.keyword.replace(
      / /g,
      '_',
    )}`;

    const result = (await this.redisCacheService.get(
      key,
    )) as SerperDevResultType[];
    let page = options.page;

    if (result) {
      const position = await this.findPosition(
        result,
        extractDomain(domainName),
      );
      if (!options.page) {
        page = position ? Math.ceil(position / options.limit) : 1;
      }
      data = result
        .slice((page - 1) * options.limit, options.limit * page)
        .map((item) => {
          return {
            url: item.link,
            position: item.position,
            keywordPosition: item.position === position,
          };
        });
    }

    const meta = {
      totalItems: result?.length || 0,
      itemsPerPage: options.limit || 10,
      totalPages: Math.ceil(result?.length / options.limit) || 0,
      currentPage: page,
    } as PaginationMetaType;

    return new Top100ItemsResponse({
      items: data,
      meta,
    });
  }
}
