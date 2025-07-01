import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { TasksType } from 'modules/additional-services/types/tasks.type';
import { DataForSeoResultType } from 'modules/additional-services/types/data-for-seo-result.type';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { DeviceTypeEntity } from 'modules/device-types/entities/device-type.entity';
import { ItemResultType } from 'modules/additional-services/types/item-result.type';
import { ProjectUrlTypesEnum } from 'modules/projects/enums/project-url-types.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { exactHelper } from 'modules/projects/helpers/exact.helper';
import { domainHelper } from 'modules/projects/helpers/domain.helper';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import Bottleneck from 'bottleneck';
import { UpdateKeywordsUsingStandardQueueDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-data.type';
import { UpdateKeywordsUsingPriorityQueueDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-data.type';
import { UpdateKeywordsUsingLiveModeDataType } from 'modules/additional-services/types/update-keywords-using-live-mode-data.type';
import { serpTypeHelper } from 'modules/additional-services/helpers/serpType.helper';
import { UpdateKeywordsUsingLiveModeForLocalFinderDataType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-local-finder-data.type';
import { UpdateKeywordsUsingLiveModeForYoutubeDataType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-youtube-data-type';
import { UpdateKeywordsUsingLiveModeForBingDataType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-bing-data-type';
import { UpdateKeywordsUsingLiveModeForYahooDataType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-yahoo-data-type';
import { UpdateKeywordsUsingPriorityQueueForLocalFinderDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-for-local-finder-data-type';
import { UpdateKeywordsUsingPriorityQueueForBingDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-for-bing-data.type';
import { UpdateKeywordsUsingPriorityQueueForYahooDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-for-yahoo-data.type';
import { UpdateKeywordsUsingStandardQueueForGoogleLocalDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-for-google-local-data.type';
import { UpdateKeywordsUsingLiveModeForLocalFinderResultType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-local-finder-result.type';
import { ProcessSearchResultType } from 'modules/additional-services/types/process-search-result.type';
import { UpdateKeywordsUsingLiveModeForGoogleMapsDataType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-google-maps-data.type';
import { UpdateKeywordsUsingLiveModeForGoogleMapsResultType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-google-maps-result.type';
import { UpdateKeywordsUsingStandardQueueForGoogleMapsDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-for-google-maps-data.type';
import { UpdateKeywordsUsingPriorityQueueForGoogleMapsDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-for-google-maps-data.type';
import { UpdateKKeywordsUsingLiveModeForYoutubeDataType } from 'modules/additional-services/types/updateK-keywords-using-live-mode-for-youtube-data.type';
import { UpdateKeywordsUsingLiveModeForYoutubeResultType } from 'modules/additional-services/types/update-keywords-using-live-mode-for-youtube-result.type';
import { youtubeVideoId } from 'modules/additional-services/helpers/youtubeVideoId.helper';
import { UpdateKeywordsUsingPriorityQueueForYoutubeDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-for-youtube-data.type';
import { UpdateKeywordsUsingStandardQueueForYoutubeDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-for-youtube-data.type';
import { ItemResultForBingType } from 'modules/additional-services/types/item-result-for-bing.type';
import { UpdateKeywordsUsingStandardQueueForBingDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-for-bing-data.type';
import { ItemResultForYahooType } from 'modules/additional-services/types/item-result-for-yahoo.type';
import { UpdateKeywordsUsingStandardQueueForYahooDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-for-yahoo-data.type';
import { UpdateKeywordsUsingPriorityQueueForBaiduDataType } from 'modules/additional-services/types/update-keywords-using-priority-queue-for-baidu-data.type';
import { UpdateKeywordsUsingStandardQueueForBaiduDataType } from 'modules/additional-services/types/update-keywords-using-standard-queue-for-baidu-data.type';
import { ItemResultForBaiduType } from 'modules/additional-services/types/item-result-for-baidu.type';

@Injectable()
export class DataForSeoService {
  private limiter12: Bottleneck;
  private limiter6000: Bottleneck;
  /**
   * Initializes a new instance of the class with the provided configuration and logging services.
   *
   * @param {ConfigService} configService - The service used for configuration management.
   * @param {CliLoggingService} cliLoggingService - The service used for command-line interface logging.
   *
   * @return {void}
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly cliLoggingService: CliLoggingService,
  ) {
    this.limiter12 = new Bottleneck({
      minTime: 5000, // Minimum time between requests (5 seconds)
      maxConcurrent: 12, // Maximum number of parallel requests
      reservoir: 12, // Initial number of allowed requests
      reservoirRefreshInterval: 60000, // Limit update time (1 minute)
      reservoirRefreshAmount: 12, // Number of allowed requests after update
    });
    this.limiter6000 = new Bottleneck({
      minTime: 10, // Minimum time between requests 10 ms
      maxConcurrent: 100, // Maximum 100 parallel tasks
      reservoir: 6000, // Maximum 6000 requests per minute
      reservoirRefreshInterval: 60000, // Refreshing the tank every 60 seconds
      reservoirRefreshAmount: 6000, // Tank refilling up to 6000 requests
    });
  }

  async keywordDataLocationsForBing(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/keywords_data/bing/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async keywordDataLocationsForGoogle(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async locationsForYahoo(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/serp/yahoo/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async locationsForYoutube(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/serp/youtube/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async locationsForBing(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/serp/bing/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async locationsForBaidu(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/serp/baidu/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async locationsForGoogle(): Promise<
    {
      location_code: number;
      location_name: string;
      location_code_parent?: number;
      country_iso_code: string;
      location_type: string;
    }[]
  > {
    const locations = axios.get(
      'https://api.dataforseo.com/v3/serp/google/locations',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await locations.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async languagesForBaidu(): Promise<
    { language_name: string; language_code: string }[]
  > {
    const languages = axios.get(
      'https://api.dataforseo.com/v3/serp/baidu/languages',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await languages.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async languagesForYahoo(): Promise<
    { language_name: string; language_code: string }[]
  > {
    const languages = axios.get(
      'https://api.dataforseo.com/v3/serp/yahoo/languages',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await languages.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  async languagesForYouTube(): Promise<
    { language_name: string; language_code: string }[]
  > {
    const languages = axios.get(
      'https://api.dataforseo.com/v3/serp/youtube/languages',
      {
        auth: {
          username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
          password: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_PASSWORD),
        },
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const result = await languages.then((result) => {
      return result.data.tasks[0].result;
    });
    return result;
  }

  /**
   * Updates the given keywords using the standard queue for YouTube.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity objects that need to be updated.
   * @return {Promise<void>} A promise that resolves when the keywords have been updated.
   */
  async updateKeywordsUsingStandardQueueForYoutube(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueForYoutubeDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: keyword.project.language.code.toLowerCase(),
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          block_depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/youtube/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );

        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/youtube/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using the standard queue for Google Maps by sending keyword data
   * to the DataForSEO API. This function ensures that the keyword data is sent in batches
   * of up to 100 keywords per request.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity objects to be updated.
   * @return {Promise<void>} A promise that resolves when all keyword data has been sent to the API.
   */
  async updateKeywordsUsingStandardQueueForGoogleMaps(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueForGoogleMapsDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: keyword.project.language.code.toLowerCase(),
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          se_domain: keyword.project.region.name,
          depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/maps/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/google/maps/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using the standard queue for Google Local.
   *
   * @param {KeywordEntity[]} keywords - The array of keyword entities that need to be updated using the standard queue for Google Local.
   * @return {Promise<void>} A promise that resolves when the update process is complete.
   */
  async updateKeywordsUsingStandardQueueForGoogleLocal(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueForGoogleLocalDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: keyword.project.language.code.toLowerCase(),
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/local_finder/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/google/local_finder/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords by sending batched requests to the Yahoo organic search API using the standard queue system.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity objects that need to be updated.
   * @return {Promise<void>} A promise that resolves when all keyword updates have been sent.
   */
  async updateKeywordsUsingStandardQueueForYahoo(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueForYahooDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: keyword.project.language.code.toLowerCase(),
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/yahoo/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/yahoo/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using the standard queue for Baidu.
   *
   * @param {KeywordEntity[]} keywords - An array of keyword entities to be updated.
   * @return {Promise<void>} A promise that resolves when the keywords have been processed.
   */
  async updateKeywordsUsingStandardQueueForBaidu(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueForBaiduDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: 'zh_CN',
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        const test = await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/baidu/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      const test = await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/baidu/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using the standard queue for Bing. It sends keyword data to the DataForSEO
   * API in batches of 100.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity objects to be updated.
   * @return {Promise<void>} - A promise that resolves when the update process is complete.
   */
  async updateKeywordsUsingStandardQueueForBing(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueForBingDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: keyword.project.language.code.toLowerCase(),
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/bing/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/bing/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using the standard queue by posting them in batches to an external API.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity objects to be updated.
   * @return {Promise<void>} - A Promise that resolves when all keywords have been processed.
   */
  async updateKeywordsUsingStandardQueue(
    keywords: KeywordEntity[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingStandardQueueDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          calculate_rectangles: false,
          language_code: keyword.project.language.code.toLowerCase(),
          se_domain: keyword.project.region.name,
          location_code: keyword.project.location.locationCode,
          device: keyword.deviceType.name.toLowerCase(),
          depth: 100,
          priority: 1,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${keyword.project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/google/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using a priority queue for Yahoo search.
   * This method processes as many as 100 keywords at a time,
   * sending them to the DataForSEO API for Yahoo organic search.
   *
   * @param {ProjectEntity} project - The project entity containing project details.
   * @param {DeviceTypeEntity} deviceType - The device type entity indicating the device used.
   * @param {Array<{ id: IdType, name: string }>} keywords - An array of keyword objects to be updated, each object should contain an id and a name.
   * @return {Promise<void>} - A promise that resolves when the keywords have been successfully updated.
   */
  async updateKeywordsUsingPriorityQueueForYahoo(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueForYahooDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: project.language.code.toLowerCase(),
          location_code: project.location.locationCode,
          device: deviceType.name.toLowerCase(),
          depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/yahoo/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/yahoo/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using a priority queue for Baidu search engine tasks.
   * This function constructs data payloads for keyword updates and posts them
   * to the DataForSEO API, respecting the rate limits.
   *
   * @param {ProjectEntity} project - The project entity containing project-related information.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the target device.
   * @param {Object[]} keywords - An array of keyword objects to be updated.
   * @param {IdType} keywords[].id - The unique identifier of the keyword.
   * @param {string} keywords[].name - The name of the keyword.
   * @return {Promise<void>} A Promise that resolves when all keyword updates are posted.
   */
  async updateKeywordsUsingPriorityQueueForBaidu(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueForBaiduDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: 'zh_CN',
          location_code: 2156,
          device: deviceType.name.toLowerCase(),
          depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/baidu/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/baidu/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using priority queue for Bing. This method processes a list of keywords
   * and sends batches of them to the DataForSEO API. A new request is sent for every 100 keywords.
   *
   * @param {ProjectEntity} project - The project entity containing project-related data.
   * @param {DeviceTypeEntity} deviceType - The device type entity indicating the type of device.
   * @param {Array<{ id: IdType, name: string }>} keywords - An array of keyword objects each containing an id and a name.
   * @return {Promise<void>} Resolves when the keywords have been successfully updated.
   */
  async updateKeywordsUsingPriorityQueueForBing(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueForBingDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: project.language.code.toLowerCase(),
          location_code: project.location.locationCode,
          device: deviceType.name.toLowerCase(),
          depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/bing/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/bing/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates the YouTube keywords using a priority queue for a given project and device type.
   *
   * This method constructs and posts tasks to the DataForSEO API for updating YouTube keywords.
   * Tasks are posted in batches to manage API rate limits efficiently.
   *
   * @param {ProjectEntity} project - The project entity containing information such as language and location codes.
   * @param {DeviceTypeEntity} deviceType - The device type entity representing the type of device being targeted (e.g., desktop, mobile).
   * @param {Array<{id: IdType, name: string}>} keywords - An array of keyword objects, each containing an id and name property.
   * @return {Promise<void>} - A promise that resolves when all keyword update tasks have been posted.
   */
  async updateKeywordsUsingPriorityQueueForYoutube(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueForYoutubeDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: project.language.code.toLowerCase(),
          location_code: project.location.locationCode,
          device: deviceType.name.toLowerCase(),
          block_depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/youtube/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/youtube/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using a priority queue for Google Maps.
   *
   * @param {ProjectEntity} project - The project entity containing configuration details for the update.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the device being used.
   * @param {Array<{id: IdType, name: string}>} keywords - An array of keyword objects, each with an id and name.
   * @return {Promise<void>} A promise that resolves when the keywords have been successfully updated.
   */
  async updateKeywordsUsingPriorityQueueForGoogleMaps(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueForGoogleMapsDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: project.language.code.toLowerCase(),
          location_code: project.location.locationCode,
          device: deviceType.name.toLowerCase(),
          se_domain: project.region.name,
          depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/maps/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/google/maps/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using a priority queue for Google Local Finder by sending tasks to DataForSEO API.
   *
   * @param {ProjectEntity} project - The project entity containing relevant project details.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the type of device to target.
   * @param {Object[]} keywords - An array of keyword objects each containing an id and name.
   * @param {IdType} keywords[].id - The unique identifier for the keyword.
   * @param {string} keywords[].name - The name of the keyword to update.
   * @return {Promise<void>} - A promise that resolves when all keywords have been submitted for updating.
   */
  async updateKeywordsUsingPriorityQueueForGoogleLocal(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueForLocalFinderDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          language_code: project.language.code.toLowerCase(),
          location_code: project.location.locationCode,
          device: deviceType.name.toLowerCase(),
          depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/local_finder/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/google/local_finder/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using the provided priority queue.
   * This function sends keyword data in batches to an external API for processing.
   *
   * @param {ProjectEntity} project - The project entity containing the relevant project data.
   * @param {DeviceTypeEntity} deviceType - The device type entity containing the relevant device information.
   * @param {Array} keywords - An array of keywords to be updated, each keyword is an object with 'id' and 'name' properties.
   * @return {Promise<void>} A promise that resolves when the task is complete.
   */
  async updateKeywordsUsingPriorityQueue(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keywords: { id: IdType; name: string }[],
  ): Promise<void> {
    let data: UpdateKeywordsUsingPriorityQueueDataType[] = [];
    for (const keyword of keywords) {
      if (keyword.name.length > 0) {
        data.push({
          keyword: keyword.name,
          calculate_rectangles: false,
          language_code: project.language.code.toLowerCase(),
          se_domain: project.region.name,
          location_code: project.location.locationCode,
          device: deviceType.name.toLowerCase(),
          depth: 100,
          priority: 2,
          postback_url: `${this.configService.get(
            ConfigEnvEnum.FASTIFY_BACKEND_URL,
          )}/keyword-updating`,
          postback_data: 'advanced',
          tag: `project_id_${project.id}_keyword_id_${keyword.id}`,
        });
      }

      if (data.length === 100) {
        await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/organic/task_post',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        data = [];
      }
    }
    if (data.length > 0) {
      await this.limiter6000.schedule(() =>
        axios.post(
          'https://api.dataforseo.com/v3/serp/google/organic/task_post',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );
    }
  }

  /**
   * Updates keywords using live mode for Yahoo via the DataForSEO API.
   *
   * @param {ProjectEntity} project - The project entity containing project-specific information such as language and location.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the type of device (e.g., desktop, mobile).
   * @param {KeywordEntity} keyword - The keyword entity representing the keyword to be updated.
   * @return {Promise<ItemResultForYahooType[]>} - A promise that resolves to an array of item results from Yahoo.
   */
  async updateKeywordsUsingLiveModeForYahoo(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ): Promise<ItemResultForYahooType[]> {
    const data: UpdateKeywordsUsingLiveModeForYahooDataType[] = [];
    data.push({
      keyword: keyword.name,
      language_code: project.language.code.toLowerCase(),
      location_code: project.location.locationCode,
      device: deviceType.name.toLowerCase(),
      depth: 100,
    });
    try {
      if (data.length > 0) {
        const result = await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/yahoo/organic/live/advanced',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        if (result.data.tasks?.length > 0) {
          return result.data.tasks[0].result[0].items_count > 0
            ? result.data.tasks[0].result[0].items
            : [];
        }
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: updateKeywordsUsingLiveModeForYahoo',
        error,
      );
    }
  }

  /**
   * Updates keywords for YouTube using live mode data from an external SEO API.
   *
   * @param {ProjectEntity} project - The project entity containing language and location details.
   * @param {DeviceTypeEntity} deviceType - The device type entity representing the device type.
   * @param {KeywordEntity} keyword - The keyword entity containing the keyword details.
   * @return {Promise<UpdateKeywordsUsingLiveModeForYoutubeResultType[]>} A promise that resolves to an array of result items.
   */
  async updateKeywordsUsingLiveModeForYoutube(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ): Promise<UpdateKeywordsUsingLiveModeForYoutubeResultType[]> {
    const data: UpdateKKeywordsUsingLiveModeForYoutubeDataType[] = [];
    if (keyword.name.length > 0) {
      data.push({
        keyword: keyword.name,
        language_code: project.language.code.toLowerCase(),
        location_code: project.location.locationCode,
        device: deviceType.name.toLowerCase(),
        block_depth: 100,
      });
      try {
        if (data.length > 0) {
          const result = await axios.post(
            'https://api.dataforseo.com/v3/serp/youtube/organic/live/advanced',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          );
          if (result.data.tasks?.length > 0) {
            return result.data.tasks[0].result[0].items_count > 0
              ? result.data.tasks[0].result[0].items
              : [];
          }
        }
      } catch (error) {
        this.cliLoggingService.error(
          'Error: updateKeywordsUsingLiveModeForYoutube',
          error,
        );
      }
    }
  }

  /**
   * Updates keywords using live mode for Google Maps.
   *
   * @param {ProjectEntity} project - The project configuration containing region, language, and location information.
   * @param {DeviceTypeEntity} deviceType - The type of device to be used (e.g. mobile, desktop).
   * @param {KeywordEntity} keyword - The keyword entity which contains the keyword to be updated.
   * @return {Promise<UpdateKeywordsUsingLiveModeForGoogleMapsResultType[]>} - A promise that resolves with an array of updated keywords results.
   */
  async updateKeywordsUsingLiveModeForGoogleMaps(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ): Promise<UpdateKeywordsUsingLiveModeForGoogleMapsResultType[]> {
    const data: UpdateKeywordsUsingLiveModeForGoogleMapsDataType[] = [];
    if (keyword.name.length > 0) {
      data.push({
        keyword: keyword.name,
        se_domain: project.region.name,
        language_code: project.language.code.toLowerCase(),
        location_code: project.location.locationCode,
        device: deviceType.name.toLowerCase(),
        depth: 100,
      });
      try {
        if (data.length > 0) {
          const result = await axios.post(
            'https://api.dataforseo.com/v3/serp/google/maps/live/advanced',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          );
          if (result.data.tasks?.length > 0) {
            return result.data.tasks[0].result[0].items_count > 0
              ? result.data.tasks[0].result[0].items
              : [];
          }
        }
      } catch (error) {
        this.cliLoggingService.log('updateKeywordsUsingLiveModeForLocalFinder');
        this.cliLoggingService.error(error);
      }
    }
  }

  /**
   * Updates keywords using live mode for the local finder based on the provided project, device type, and keyword.
   *
   * @param {ProjectEntity} project - The project entity containing necessary configurations like language and location.
   * @param {DeviceTypeEntity} deviceType - The device type entity, specifying the device used for the keyword update.
   * @param {KeywordEntity} keyword - The keyword entity that needs to be updated.
   * @return {Promise<UpdateKeywordsUsingLiveModeForLocalFinderResultType[]>} A promise that resolves to an array of results from the keyword update process.
   */
  async updateKeywordsUsingLiveModeForLocalFinder(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ): Promise<UpdateKeywordsUsingLiveModeForLocalFinderResultType[]> {
    const data: UpdateKeywordsUsingLiveModeForLocalFinderDataType[] = [];
    if (keyword.name.length > 0) {
      data.push({
        keyword: keyword.name,
        priority: 2,
        language_code: project.language.code.toLowerCase(),
        location_code: project.location.locationCode,
        device: deviceType.name.toLowerCase(),
        depth: 100,
      });
      try {
        if (data.length > 0) {
          const result = await axios.post(
            'https://api.dataforseo.com/v3/serp/google/local_finder/live/advanced',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          );
          if (result.data.tasks?.length > 0) {
            return result.data.tasks[0].result[0].items_count > 0
              ? result.data.tasks[0].result[0].items
              : [];
          }
        }
      } catch (error) {
        this.cliLoggingService.log('updateKeywordsUsingLiveModeForLocalFinder');
        this.cliLoggingService.error(error);
      }
    }
  }

  /**
   * Updates keywords using live mode for Bing search engine.
   *
   * @param {ProjectEntity} project - The project entity containing project details.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the device used.
   * @param {KeywordEntity} keyword - The keyword entity containing the keyword to update.
   * @return {Promise<ItemResultForBingType[]>} A promise that resolves to an array of item results for Bing.
   */
  async updateKeywordsUsingLiveModeForBing(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ): Promise<ItemResultForBingType[]> {
    const data: UpdateKeywordsUsingLiveModeForBingDataType[] = [];
    if (keyword.name.length > 0) {
      data.push({
        keyword: keyword.name,
        priority: 2,
        calculate_rectangles: false,
        language_code: project.language.code.toLowerCase(),
        location_code: project.location.locationCode,
        device: deviceType.name.toLowerCase(),
        depth: 100,
      });
    }
    try {
      if (data.length > 0) {
        const result = await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/bing/organic/live/advanced',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        if (result.data.tasks?.length > 0) {
          return result.data.tasks[0].result[0].items_count > 0
            ? result.data.tasks[0].result[0].items
            : [];
        }
      }
    } catch (error) {
      this.cliLoggingService.log('updateKeywordsUsingLiveModeForYouTube');
      this.cliLoggingService.error(error);
    }
  }

  /**
   * Updates the keywords using live mode for YouTube by sending a request to the DataForSEO API.
   *
   * @param {ProjectEntity} project - The project entity containing project-specific details.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the type of device.
   * @param {KeywordEntity} keyword - The keyword entity containing the keyword information.
   * @return {Promise<Array>} A promise that resolves to an array of keyword results from the API.
   */
  async updateKeywordsUsingLiveModeForYouTube(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ) {
    const data: UpdateKeywordsUsingLiveModeForYoutubeDataType[] = [];
    if (keyword.name.length > 0) {
      data.push({
        keyword: keyword.name,
        language_code: project.language.code.toLowerCase(),
        location_code: project.location.locationCode,
        device: deviceType.name.toLowerCase(),
        depth: 20,
      });
    }
    try {
      if (data.length > 0) {
        const result = await axios.post(
          'https://api.dataforseo.com/v3/serp/youtube/organic/live/advanced',
          data,
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        );
        if (result.data.tasks?.length > 0) {
          return result.data.tasks[0].result[0].items_count > 0
            ? result.data.tasks[0].result[0].items
            : [];
        }
      }
    } catch (error) {
      this.cliLoggingService.log('updateKeywordsUsingLiveModeForYouTube');
      this.cliLoggingService.error(error);
    }
  }

  /**
   * Updates the keywords using live mode by sending the keyword data to the DataForSEO API and retrieving the results.
   *
   * @param {ProjectEntity} project - The project containing parameters like language code and region name.
   * @param {DeviceTypeEntity} deviceType - The device type entity specifying the device (e.g., mobile, desktop).
   * @param {KeywordEntity} keyword - The keyword entity containing the keyword to be updated.
   * @return {Promise<ItemResultType[]>} - A promise that resolves to an array of item result types returned from the API.
   */
  async updateKeywordsUsingLiveMode(
    project: ProjectEntity,
    deviceType: DeviceTypeEntity,
    keyword: KeywordEntity,
  ): Promise<ItemResultType[]> {
    const data: UpdateKeywordsUsingLiveModeDataType[] = [];
    if (keyword.name.length > 0) {
      data.push({
        keyword: keyword.name,
        calculate_rectangles: false,
        language_code: project.language.code.toLowerCase(),
        se_domain: project.region.name,
        location_code: project.location.locationCode,
        device: deviceType.name.toLowerCase(),
        depth: 100,
      });
    }

    try {
      if (data.length > 0) {
        const result = await this.limiter6000.schedule(() =>
          axios.post(
            'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
            data,
            {
              auth: {
                username: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
                ),
                password: this.configService.get(
                  ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
                ),
              },
              headers: {
                'content-type': 'application/json',
              },
            },
          ),
        );
        if (result.data.tasks?.length > 0) {
          return result.data.tasks[0].result[0].items_count > 0
            ? result.data.tasks[0].result[0].items
            : [];
        }
      }
    } catch (error) {
      this.cliLoggingService.log('updateKeywordsUsingLiveMode');
      this.cliLoggingService.error(error);
    }
  }

  /**
   * Processes search results for YouTube, analyzing the given results and project details to determine keyword ranking and competitor data.
   *
   * @param {UpdateKeywordsUsingLiveModeForYoutubeResultType[]} result - An array of search result objects from YouTube.
   * @param {ProjectEntity} project - The project entity containing project details and competitor information.
   * @return {Promise<ProcessSearchResultType>} - A promise resolved with the processed search result data, including position, url, dataCompetitors and searchResult.
   */
  async processSearchResultForYoutube(
    result: UpdateKeywordsUsingLiveModeForYoutubeResultType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    let url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        domainName: competitor.domainName,
      });
    }

    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }

      if (item.video_id === youtubeVideoId(project.url)) {
        position = position !== 101 ? position : item.rank_absolute;
        url = url !== '' ? url : item.url;
      }
      if (dataCompetitors.length > 0) {
        for (const competitor of dataCompetitors) {
          if (item.video_id === youtubeVideoId(competitor.domainName)) {
            competitor.position =
              competitor.position !== 101
                ? competitor.position
                : item.rank_absolute;
          }
        }
      }

      searchResult.push({
        position: item.rank_absolute,
        link: `${item.title ?? item.name ?? ''} ${
          item.url
            ? `(<a href="${item.url}" target="_blank">${item.url}</a>)`
            : ''
        }`,
      });
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Processes the search result data for Google Maps, associating it with a given project and its competitors.
   *
   * @param {UpdateKeywordsUsingLiveModeForGoogleMapsResultType[]} result - The array of search result items to be processed.
   * @param {ProjectEntity} project - The project entity whose search results and competitors are being processed.
   * @return {Promise<ProcessSearchResultType>} - A promise resolving to the processed search result data, including positions, URLs, competitors, and search result details.
   */
  async processSearchResultForGoogleMaps(
    result: UpdateKeywordsUsingLiveModeForGoogleMapsResultType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    const url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        businessName: competitor.businessName,
        url: competitor.url,
      });
    }

    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }

      if (item.title.toLowerCase() === project.businessName) {
        if (project.url && item.url && exactHelper(project.url, item.url)) {
          position = position !== 101 ? position : item.rank_absolute;
        } else {
          position = position !== 101 ? position : item.rank_absolute;
        }
      }
      if (dataCompetitors.length > 0) {
        for (const competitor of dataCompetitors) {
          if (item.title.toLowerCase() === competitor.businessName) {
            if (
              competitor.url &&
              item.url &&
              exactHelper(competitor.url, item.url)
            ) {
              competitor.position =
                competitor.position !== 101
                  ? competitor.position
                  : item.rank_absolute;
            } else {
              competitor.position =
                competitor.position !== 101
                  ? competitor.position
                  : item.rank_absolute;
            }
          }
        }
      }

      searchResult.push({
        position: item.rank_absolute,
        link: `${item.title} ${
          item.url
            ? `(<a href="${item.url}" target="_blank">${item.url}</a>)`
            : ''
        }`,
      });
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Processes search results for Google Local and analyzes the ranking position of the project and its competitors.
   *
   * @param {UpdateKeywordsUsingLiveModeForLocalFinderResultType[]} result - Array of search results to be processed.
   * @param {ProjectEntity} project - The project entity containing information about the project and its competitors.
   * @return {Promise<ProcessSearchResultType>} - A promise that resolves to an object containing the processed search result data including position, url, dataCompetitors, and searchResult.
   */
  async processSearchResultForGoogleLocal(
    result: UpdateKeywordsUsingLiveModeForLocalFinderResultType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    const url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        businessName: competitor.businessName,
        url: competitor.url,
      });
    }
    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }

      if (item.title.toLowerCase() === project.businessName) {
        if (project.url && item.url && exactHelper(project.url, item.url)) {
          position = position !== 101 ? position : item.rank_absolute;
        } else {
          position = position !== 101 ? position : item.rank_absolute;
        }
      }
      if (dataCompetitors.length > 0) {
        for (const competitor of dataCompetitors) {
          if (item.title.toLowerCase() === competitor.businessName) {
            if (
              competitor.url &&
              item.url &&
              exactHelper(competitor.url, item.url)
            ) {
              competitor.position =
                competitor.position !== 101
                  ? competitor.position
                  : item.rank_absolute;
            } else {
              competitor.position =
                competitor.position !== 101
                  ? competitor.position
                  : item.rank_absolute;
            }
          }
        }
      }

      searchResult.push({
        position: item.rank_absolute,
        link: `${item.title} ${
          item.url
            ? `(<a href="${item.url}" target="_blank">${item.url}</a>)`
            : ''
        }`,
      });
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Processes the search result for Yahoo, updating the positions and URLs for the project
   * and its competitors based on the search results.
   *
   * @param {ItemResultForYahooType[]} result - An array of search result items from Yahoo.
   * @param {ProjectEntity} project - The project entity containing project specifics and competitors.
   * @return {Promise<ProcessSearchResultType>} - The processed search results including position, URL, competitors' data, and search result summary.
   */
  async processSearchResultForYahoo(
    result: ItemResultForYahooType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    let url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        domainName: competitor.domainName,
      });
    }
    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }
      if (project.urlType.name === ProjectUrlTypesEnum.url) {
        if (item.domain && item.url) {
          if (exactHelper(project.url, item.domain)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              if (exactHelper(competitor.domainName, item.domain)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }

          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      } else if (project.urlType.name === ProjectUrlTypesEnum.domain) {
        if (item.domain && item.url) {
          const mainString = item.domain;
          if (domainHelper(project.url, mainString)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              const mainString = item.domain;
              const substringToFind = competitor.domainName;
              if (domainHelper(substringToFind, mainString)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }
          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      }
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Processes the search results obtained from Baidu for a given project,
   * updating the position and URL of the project and its competitors.
   *
   * @param {ItemResultForBaiduType[]} result - Array of search result items from Baidu.
   * @param {ProjectEntity} project - The project for which search results are being processed.
   * @return {Promise<ProcessSearchResultType>} - An object containing the position, URL, data of competitors, and the search results.
   */
  async processSearchResultForBaidu(
    result: ItemResultForBaiduType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    let url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        domainName: competitor.domainName,
      });
    }
    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }
      if (project.urlType.name === ProjectUrlTypesEnum.url) {
        if (item.domain && item.url) {
          if (exactHelper(project.url, item.domain)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              if (exactHelper(competitor.domainName, item.domain)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }

          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      } else if (project.urlType.name === ProjectUrlTypesEnum.domain) {
        if (item.domain && item.url) {
          const mainString = item.domain;
          if (domainHelper(project.url, mainString)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              const mainString = item.domain;
              const substringToFind = competitor.domainName;
              if (domainHelper(substringToFind, mainString)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }
          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      }
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Processes search results from Bing and extracts relevant data such as position and URL.
   *
   * @param {ItemResultForBingType[]} result - An array of search result items from Bing.
   * @param {ProjectEntity} project - The project entity containing relevant project data.
   * @return {Promise<ProcessSearchResultType>} The processed search result data including position, URL, competitors, and searchResult.
   */
  async processSearchResultForBing(
    result: ItemResultForBingType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    let url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        domainName: competitor.domainName,
      });
    }
    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }
      if (project.urlType.name === ProjectUrlTypesEnum.url) {
        if (item.domain && item.url) {
          if (exactHelper(project.url, item.domain)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              if (exactHelper(competitor.domainName, item.domain)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }

          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      } else if (project.urlType.name === ProjectUrlTypesEnum.domain) {
        if (item.domain && item.url) {
          const mainString = item.domain;
          if (domainHelper(project.url, mainString)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              const mainString = item.domain;
              const substringToFind = competitor.domainName;
              if (domainHelper(substringToFind, mainString)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }
          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      }
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Processes the search result and extracts relevant information based on the project settings.
   *
   * @param {ItemResultType[]} result - The array of search result items.
   * @param {ProjectEntity} project - The project entity containing competitors and URL type information.
   * @return {Promise<ProcessSearchResultType>} - An object containing the position, URL, dataCompetitors, and searchResult.
   */
  async processSearchResult(
    result: ItemResultType[],
    project: ProjectEntity,
  ): Promise<ProcessSearchResultType> {
    let position = 101;
    let url = '';
    const competitors = project.competitors;
    const dataCompetitors = [];
    const searchResult = [];
    for (const competitor of competitors) {
      dataCompetitors.push({
        position: 101,
        id: competitor.id,
        domainName: competitor.domainName,
      });
    }
    for (const item of result) {
      if (item.rank_absolute > 100) {
        break;
      }
      if (project.urlType.name === ProjectUrlTypesEnum.url) {
        if (item.domain && item.url) {
          if (exactHelper(project.url, item.domain)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              if (exactHelper(competitor.domainName, item.domain)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }

          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      } else if (project.urlType.name === ProjectUrlTypesEnum.domain) {
        if (item.domain && item.url) {
          const mainString = item.domain;
          if (domainHelper(project.url, mainString)) {
            position = position !== 101 ? position : item.rank_absolute;
            url = url !== '' ? url : item.url;
          }
          if (dataCompetitors.length > 0) {
            for (const competitor of dataCompetitors) {
              const mainString = item.domain;
              const substringToFind = competitor.domainName;
              if (domainHelper(substringToFind, mainString)) {
                competitor.position =
                  competitor.position !== 101
                    ? competitor.position
                    : item.rank_absolute;
              }
            }
          }
          searchResult.push({
            position: item.rank_absolute,
            link: `<a href="${item.url}" target="_blank">${item.url}</a>`,
          });
        } else {
          searchResult.push({
            position: item.rank_absolute,
            link: serpTypeHelper(item.type),
          });
        }
      }
    }
    return { position, url, dataCompetitors, searchResult };
  }

  /**
   * Creates a task for fetching Bing search volume data.
   *
   * @param {string[]} keywords - Array of keywords to fetch the search volume for.
   * @param {string} language - The language for the search volume data.
   * @param {IdType} locationCode - Location code for regional search volume data.
   * @param {IdType} projectId - Unique identifier for the project.
   * @return {Promise<void>} A promise that resolves when the task has been created successfully.
   */
  async createTaskForBing(
    keywords: string[],
    language: string,
    locationCode: IdType,
    projectId: IdType,
  ): Promise<void> {
    await this.limiter6000.schedule(() =>
      axios.post(
        'https://api.dataforseo.com/v3/keywords_data/bing/search_volume/task_post',
        [
          {
            keywords,
            search_partners: true,
            language_name: language,
            location_code: locationCode,
            tag: `project_id_${projectId}`,
            postback_url: `${this.configService.get(
              ConfigEnvEnum.FASTIFY_BACKEND_URL,
            )}/task-ready`,
          },
        ],
        {
          auth: {
            username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
            password: this.configService.get(
              ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
            ),
          },
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    );
  }

  /**
   * Creates a task for fetching search volume data for a list of keywords.
   *
   * @param {string[]} keywords - An array of keywords for which search volume data is required.
   * @param {string} language - The language in which the keywords are.
   * @param {IdType} locationCode - The location code for the search volume data.
   * @param {IdType} projectId - The project identifier to tag the task.
   * @return {Promise<void>} A promise that resolves when the task is created successfully.
   */
  async createTask(
    keywords: string[],
    language: string,
    locationCode: IdType,
    projectId: IdType,
  ): Promise<void> {
    await this.limiter6000.schedule(() =>
      axios.post(
        'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/task_post',
        [
          {
            keywords,
            search_partners: true,
            language_name: language,
            location_code: locationCode,
            tag: `project_id_${projectId}`,
            postback_url: `${this.configService.get(
              ConfigEnvEnum.FASTIFY_BACKEND_URL,
            )}/task-ready`,
          },
        ],
        {
          auth: {
            username: this.configService.get(ConfigEnvEnum.DATA_FOR_SEO_LOGIN),
            password: this.configService.get(
              ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
            ),
          },
          headers: {
            'content-type': 'application/json',
          },
        },
      ),
    );
  }
  /**
   * Retrieves DataForSeo results for the specified Bing Ads based on the given keywords and project information.
   *
   * @param {string[]} keywordNames - An array of keyword names to filter and search in Bing Ads.
   * @param {ProjectEntity} project - The project entity that provides context for the Bing Ads search.
   * @return {Promise<DataForSeoResultType[]>} A promise that resolves to an array of DataForSeo result types based on the given keywords and project context.
   */
  async getDataForSeoForBingAdsResult(
    keywordNames: string[],
    project: ProjectEntity,
  ): Promise<DataForSeoResultType[]> {
    keywordNames = await this.filterKeywords(keywordNames);
    if (keywordNames.length > 0) {
      const result = await this.searchBingAds(keywordNames, project);
      return result[0]?.result;
    } else {
      return [];
    }
  }

  /**
   * Fetches SEO results for the given keywords and project.
   *
   * @param {string[]} keywordNames - An array of keyword names to search for.
   * @param {ProjectEntity} project - The project entity to which the keywords belong.
   * @return {Promise<DataForSeoResultType[]>} A promise that resolves to an array of SEO result types.
   */
  async getDataForSeoResults(
    keywordNames: string[],
    project: ProjectEntity,
  ): Promise<DataForSeoResultType[]> {
    keywordNames = await this.filterKeywords(keywordNames);
    if (keywordNames.length > 0) {
      const result = await this.search(keywordNames, project);
      return result[0]?.result;
    } else {
      return [];
    }
  }

  /**
   * Filters a list of keywords by removing those that contain forbidden characters
   * or exceed length and word count constraints.
   *
   * @param {string[]} keywords - An array of keyword strings to be filtered.
   * @return {Promise<string[]>} A promise that resolves to an array of keywords that pass the filters.
   */
  private async filterKeywords(keywords: string[]) {
    const forbiddenChars = /[,!@%^()={}~`<>?\\|—]/;
    return keywords.filter(
      (keyword) =>
        !forbiddenChars.test(keyword) &&
        keyword.length <= 80 &&
        keyword.split(/\s+/).length <= 10,
    );
  }

  /**
   * Searches Bing Ads using the specified keywords and project details.
   *
   * @param {string[]} keywords - An array of keywords to search for.
   * @param {ProjectEntity} project - The project entity which includes language and location information.
   * @return {Promise<TasksType[]>} - A promise that resolves to an array of tasks containing search data.
   */
  async searchBingAds(
    keywords: string[],
    project: ProjectEntity,
  ): Promise<TasksType[]> {
    try {
      const result = await this.limiter12.schedule(() =>
        axios.post(
          `https://api.dataforseo.com/v3/keywords_data/bing/search_volume/live`,
          [
            {
              keywords,
              search_partners: true,
              language_code: project.language.code.toLowerCase(),
              location_code: project.location.locationCode,
            },
          ],
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );

      return result.data.tasks;
    } catch (error) {
      this.cliLoggingService.error('Error: searchBingAds', error);
    }
  }

  /**
   * Searches for Google Ads search volume data for the provided keywords and project configuration.
   *
   * @param {string[]} keywords - An array of keywords to search for.
   * @param {ProjectEntity} project - A ProjectEntity object containing language and location configuration for the search.
   * @return {Promise<TasksType[]>} A promise that resolves to an array of tasks containing search volume data.
   */
  async search(
    keywords: string[],
    project: ProjectEntity,
  ): Promise<TasksType[]> {
    try {
      const result = await this.limiter12.schedule(() =>
        axios.post(
          `https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live`,
          [
            {
              keywords,
              search_partners: true,
              language_code: project.language.code.toLowerCase(),
              location_code: project.location.locationCode,
            },
          ],
          {
            auth: {
              username: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_LOGIN,
              ),
              password: this.configService.get(
                ConfigEnvEnum.DATA_FOR_SEO_PASSWORD,
              ),
            },
            headers: {
              'content-type': 'application/json',
            },
          },
        ),
      );

      return result.data.tasks;
    } catch (error) {
      this.cliLoggingService.error('Error: search', error);
    }
  }
}
