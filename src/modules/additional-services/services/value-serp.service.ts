import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import {
  RateLimiterWrapperFactoryService,
  RateLimiterWrapperFunction,
} from 'modules/common/services/rate-limiter-factory.service';
import { SearchParamsType } from 'modules/additional-services/types/search-params.type';
import { SearchResponseType } from 'modules/additional-services/types/search-response.type';
import { RedisCacheService } from 'modules/cache/services/redis-cache.service';
import { CreateBatchType } from 'modules/additional-services/types/create-batch.type';
import { ScheduleTypesEnum } from 'modules/additional-services/enums/schedule-types.enum';
import { BatchResponseType } from 'modules/additional-services/types/batch-response.type';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { LoggingService } from 'modules/logging/services/logging.service';

const MIN_REQUEST_PERIOD = 1000;
@Injectable()
export class ValueSerpService {
  private readonly wrapIntoRateLimiter: RateLimiterWrapperFunction;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.valueserp.com';
  constructor(
    private readonly httpClient: HttpService,
    private readonly configService: ConfigService,
    private readonly redisLimiterFactory: RateLimiterWrapperFactoryService,
    private readonly redisCacheService: RedisCacheService,
    private readonly loggingService: LoggingService,
  ) {
    this.apiKey = configService.get(ConfigEnvEnum.VALUE_SERP_KEY);

    this.wrapIntoRateLimiter = redisLimiterFactory.spawnInstance({
      minTime: MIN_REQUEST_PERIOD,
      id: 'valueserp-api',
    });
  }

  /**
   * Initiates a batch process by sending a start request to the server.
   *
   * @param {string} batchId - The unique identifier of the batch to be started.
   * @return {Promise<void>} - A promise that resolves when the request completes.
   */
  async startBatch(batchId: string) {
    const params = {
      api_key: this.apiKey,
    };
    await this.httpClient
      .get(`${this.apiUrl}/batches/${batchId}/start`, { params })
      .toPromise();
  }

  /**
   * Adds a list of keyword entities to a specified batch for processing by preparing search parameters
   * and making an HTTP PUT request to the batching service.
   *
   * @param {string} batchId - Identifier for the batch to which the keywords will be added.
   * @param {KeywordEntity[]} keywords - Array of keyword entities to be added to the batch.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async addKeywordToBatch(
    batchId: string,
    keywords: KeywordEntity[],
  ): Promise<void> {
    const searches = [];
    for (const keyword of keywords) {
      searches.push({
        q: keyword.name,
        location: keyword.project.location,
        google_domain: keyword.project.region.name,
        // gl: keyword.project.country.code,
        hl: keyword.project.language.code,
        device: keyword.deviceType.name,
        custom_id: `custom_id_${keyword.id}_domain_${keyword.project.url}`,
        num: 100,
        page: 1,
      });
    }

    if (searches.length > 0) {
      const body = {
        searches,
      };
      await this.httpClient
        .put(`${this.apiUrl}/batches/${batchId}?api_key=${this.apiKey}`, body)
        .toPromise();
    }
  }

  /**
   * Creates a new batch for refreshing jobs with predefined settings.
   *
   * @return {Promise<BatchResponseType>} A promise that resolves to the response containing details of the created batch.
   */
  async createBatchForRefresh(): Promise<BatchResponseType> {
    const body = {
      name: `Batch for refresh`,
      enabled: true,
      schedule_type: ScheduleTypesEnum.MANUAL,
      priority: 'normal',
      notification_email: 'dmitriy.elementika@gmail.com',
      notification_as_csv: false,
      notification_as_json: true,
      notification_as_jsonlines: false,
      destination_ids: [this.configService.get(ConfigEnvEnum.DESTINATION_ID)],
    };
    const response = await this.httpClient
      .post(`https://api.valueserp.com/batches?api_key=${this.apiKey}`, body)
      .toPromise();
    return response.data.batch;
  }

  /**
   * Creates a new batch with the specified parameters.
   *
   * @param {CreateBatchType} newBatch The details of the new batch to be created.
   * @return {Promise<BatchResponseType>} A promise that resolves to the response containing the created batch details.
   */
  async createBatch(newBatch: CreateBatchType): Promise<BatchResponseType> {
    const body = {
      name: `Batch ${newBatch.scheduleType} - start time: ${newBatch.startTime}`,
      enabled: true,
      schedule_type: ScheduleTypesEnum.MANUAL,
      priority: 'normal',
      notification_email: 'dmitriy.elementika@gmail.com',
      notification_as_csv: false,
      notification_as_json: true,
      notification_as_jsonlines: false,
      notification_webhook: `${this.configService.get(
        ConfigEnvEnum.APP_BACKEND_URL,
      )}/batches`,
    };
    const response = await this.httpClient
      .post(`https://api.valueserp.com/batches?api_key=${this.apiKey}`, body)
      .toPromise();
    return response.data.batch;
  }

  /**
   * Performs a search request to the specified API using the provided search parameters.
   *
   * @param {SearchParamsType} searchParams - An object containing the search parameters.
   * @param {string} searchParams.q - The search query term.
   * @param {string} searchParams.location - The location to be used for the search.
   * @param {string} searchParams.google_domain - The Google domain to be used for the search.
   * @param {string} searchParams.gl - The geographic location to be used for the search.
   * @param {string} searchParams.hl - The language to be used for the search.
   * @param {string} searchParams.device - The device type for the search (e.g., 'desktop', 'mobile').
   * @return {Promise<SearchResponseType>} A promise that resolves to the search response data.
   */
  async search(searchParams: SearchParamsType): Promise<SearchResponseType> {
    try {
      const response = await this.httpClient
        .get(`${this.apiUrl}/search`, {
          params: {
            api_key: this.apiKey,
            q: searchParams.q,
            location: searchParams.location,
            google_domain: searchParams.google_domain,
            gl: searchParams.gl,
            hl: searchParams.hl,
            device: searchParams.device.toLowerCase(),
            output: 'json',
            include_html: 'false',
            num: '100',
          },
        })
        .toPromise();
      return response.data;
    } catch (error) {
      this.loggingService.error(error);
    }
  }
}
