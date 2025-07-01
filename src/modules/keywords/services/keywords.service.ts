import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { KeywordEntity } from 'modules/keywords/entities/keyword.entity';
import { IdType } from 'modules/common/types/id-type.type';
import { KeywordsPositionsService } from 'modules/keywords/services/keywords-positions.service';
import { CompetitorsService } from 'modules/competitors/services/competitors.service';
import { ProjectOverviewType } from 'modules/projects/types/project-overview.type';
import moment from 'moment';
import { ImprovedVsDeclinedType } from 'modules/projects/types/improved-vs-declined.type';
import { getStartDate } from 'modules/keywords/helpers/getStartDate';
import { GetStatisticsType } from 'modules/projects/types/get-statistics.type';
import { GetKeywordTrendsType } from 'modules/projects/types/get-keyword-trends.type';
import { KeywordTrendType } from 'modules/projects/types/keyword-trend.type';
import { PositionHistoryType } from 'modules/keywords/types/position-history.type';
import { PositionHistoryResponse } from 'modules/keywords/responses/position-history.response';
import { HistoryResponse } from 'modules/keywords/responses/history.response';
import { GetProjectPerformanceType } from 'modules/projects/types/get-project-performance.type';
import { ProjectPerformanceResponse } from 'modules/keywords/responses/project-performance.response';
import { KeywordRankingsType } from 'modules/keywords/types/keyword-rankings.type';
import { KeywordRankingsRequest } from 'modules/keywords/requests/keyword-rankings.request';
import { KeywordRankingsResponseFactory } from 'modules/keywords/factories/keyword-rankings-response.factory';
import { UpdateKeywordPositionsType } from 'modules/keywords/types/update-keyword-positions.type';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { DeleteKeywordsType } from 'modules/keywords/types/delete-keywords.type';
import { EventBus } from '@nestjs/cqrs';
import { SearchResultsType } from 'modules/keywords/types/search-results.type';
import { SearchResultsRequest } from 'modules/keywords/requests/search-results.request';
import { SearchResultsResponse } from 'modules/keywords/responses/search-results.response';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { SearchResultsResponseFactory } from 'modules/keywords/factories/search-results-response.factory';
import { GetKeywordType } from 'modules/keywords/types/get-keyword.type';
import { GetKeywordResponse } from 'modules/keywords/responses/get-keyword.response';
import { DailyAveragePositionsResponse } from 'modules/keywords/responses/daily-average-positions.response';
import { DailyAveragePositionResponse } from 'modules/keywords/responses/daily-average-position.response';
import { NotesService } from 'modules/notes/services/notes.service';
import { NotesResponse } from 'modules/keywords/responses/notes.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { CompetitorsProjectPerformanceResponse } from 'modules/competitors/responses/competitors-project-performance.response';
import { OverviewType } from 'modules/keywords/types/overview.type';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { Pagination } from 'nestjs-typeorm-paginate';
import { SortKeywordRankingsEnum } from 'modules/keywords/enums/sort-keyword-rankings.enum';
import { GetProjectKeywordsType } from 'modules/common/types/get-project-keywords.type';
import { PaginatedSearchRequest } from 'modules/common/requests/paginated-search.request';
import { TaskRequest } from 'modules/fastify/requests/task.request';
import { GetNumberOfAvailableKeywordsToUpdateType } from 'modules/keywords/types/get-number-of-available-keywords-to-update.type';
import { GetNumberOfAvailableKeywordsToUpdateResponse } from 'modules/keywords/responses/get-number-of-available-keywords-to-update.response';
import { UpdateKeywordPositionsUsingStandardQueueEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue.event';
import { OverviewCacheTransformer } from 'modules/cache/transformers/overview.cache-transformer';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { ImprovedVsDeclinedCacheTransformer } from 'modules/cache/transformers/improved-vs-declined.cache-transformer';
import { KeywordTrendsCacheTransformer } from 'modules/cache/transformers/keyword-trends.cache-transformer';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { PositionHistoryCacheTransformer } from 'modules/cache/transformers/position-history.cache-transformer';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { RemoteProjectsEvent } from 'modules/projects/events/remote-projects.event';
import { paginate } from 'modules/keywords/helpers/paginateHelper';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-google-local.event';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-google-maps.event';
import { UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-youtube.event';
import { UpdateKeywordPositionsUsingStandardQueueForBingEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-bing.event';
import { UpdateKeywordPositionsUsingStandardQueueForYahooEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-yahoo.event';
import { UpdateKeywordPositionsUsingStandardQueueForBaiduEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-baidu.event';
import { GetKeywordResponseFactory } from 'modules/keywords/factories/get-keyword-response.factory';
import { CreateTriggerInitializationEvent } from 'modules/triggers/events/create-trigger-initialization.event';

@Injectable()
export class KeywordsService {
  /**
   * Constructs an instance of the class with dependencies injected.
   *
   * @param {KeywordRepository} keywordRepository - Repository for managing keywords.
   * @param {KeywordsPositionsService} keywordsPositionsService - Service for managing keyword positions.
   * @param {CompetitorsService} competitorsService - Service for managing competitors data.
   * @param {KeywordRankingsResponseFactory} keywordRankingsResponseFactory - Factory for creating keyword ranking responses.
   * @param {EventBus} eventBus - Event bus for managing application events.
   * @param {SearchResultRepository} searchResultRepository - Repository for managing search results.
   * @param {SearchResultsResponseFactory} searchResultsResponseFactory - Factory for creating search results responses.
   * @param {NotesService} notesService - Service for managing notes.
   * @param {OverviewCacheTransformer} overviewCacheTransformer - Transformer for overview cache data.
   * @param {LatestProjectOverviewRepository} latestProjectOverviewRepository - Repository for managing latest project overviews.
   * @param {ImprovedVsDeclinedCacheTransformer} improvedVsDeclinedCacheTransformer - Transformer for improved vs. declined cache data.
   * @param {KeywordTrendsCacheTransformer} keywordTrendsCacheTransformer - Transformer for keyword trends cache data.
   * @param {ProjectPerformanceCacheTransformer} projectPerformanceCacheTransformer - Transformer for project performance cache data.
   * @param {Queue} updateKeywordPositionQueue - Queue for updating keyword positions.
   * @param {PositionHistoryCacheTransformer} positionHistoryCacheTransformer - Transformer for position history cache data.
   * @param {AccountLimitsService} accountLimitsService - Service for managing account limits.
   * @param {ProjectRepository} projectRepository - Repository for managing projects.
   * @param {Queue} projectsQueue - Queue for managing project-related tasks.
   * @return {void}
   */
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly keywordsPositionsService: KeywordsPositionsService,
    private readonly competitorsService: CompetitorsService,
    private readonly keywordRankingsResponseFactory: KeywordRankingsResponseFactory,
    private readonly eventBus: EventBus,
    private readonly searchResultRepository: SearchResultRepository,
    private readonly searchResultsResponseFactory: SearchResultsResponseFactory,
    private readonly notesService: NotesService,
    private readonly overviewCacheTransformer: OverviewCacheTransformer,
    private readonly latestProjectOverviewRepository: LatestProjectOverviewRepository,
    private readonly improvedVsDeclinedCacheTransformer: ImprovedVsDeclinedCacheTransformer,
    private readonly keywordTrendsCacheTransformer: KeywordTrendsCacheTransformer,
    private readonly projectPerformanceCacheTransformer: ProjectPerformanceCacheTransformer,
    @InjectQueue(Queues.UpdateKeywordPosition)
    private readonly updateKeywordPositionQueue: Queue,
    private readonly positionHistoryCacheTransformer: PositionHistoryCacheTransformer,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly projectRepository: ProjectRepository,
    @InjectQueue(Queues.Projects)
    private readonly projectsQueue: Queue,
    private readonly getKeywordResponseFactory: GetKeywordResponseFactory,
  ) {}

  /**
   * Checks if the specified keywords are related to the user's account.
   *
   * @param {IdType} accountId - The identifier of the account.
   * @param {IdType[]} keywordIds - An array of keyword identifiers.
   * @param {IdType} [userId] - Optional identifier of the user.
   *
   * @return {Promise<void>} - Resolves if the keywords are related to the user's account, otherwise throws a ForbiddenException.
   */
  async checkIfKeywordsAreRelatedToUserAccount(
    accountId: IdType,
    keywordIds: IdType[],
    userId?: IdType,
  ): Promise<void> {
    const keywords =
      await this.keywordRepository.getKeywordsAvailableToUserInRelationToAccount(
        accountId,
        keywordIds,
        userId,
      );
    if (keywordIds.length !== keywords.length) {
      throw new ForbiddenException('Access denied.');
    }
  }

  /**
   * Eliminates duplicate keywords for a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {string[]} keywordNames - The list of keyword names to process.
   * @param {DeviceTypesEnum} deviceType - The type of device for which the keywords are being processed.
   * @return {Promise<string[]>} A promise that resolves to a list of unique keyword names.
   */
  async eliminateDuplicationOfProjectKeywords(
    projectId: IdType,
    keywordNames: string[],
    deviceType: DeviceTypesEnum,
  ): Promise<string[]> {
    const newKeywords =
      await this.keywordRepository.eliminateRepetitiveKeywords(
        projectId,
        keywordNames,
        deviceType,
      );

    return newKeywords.map((item) => item.keyword);
  }

  /**
   * Allows manual updates for keywords in the keyword repository.
   *
   * @return {Promise<void>} A Promise that resolves when the operation is complete.
   */
  async allowManualUpdateForKeywords(): Promise<void> {
    await this.keywordRepository.allowManualUpdateForKeywords();
  }

  /**
   * Saves the results of a ready task to the keyword repository.
   *
   * @param {TaskRequest} task - The task request containing data and results.
   * @return {Promise<void>} A promise that resolves when the results are saved.
   */
  @Transactional()
  async saveResultsOfReadyTask(task: TaskRequest): Promise<void> {
    const keywords =
      await this.keywordRepository.getKeywordsByNamesWithLanguageAndLocation(
        task.data.keywords,
        task.data.language_name,
      );
    for (const keyword of keywords) {
      const data = task.result.find((item) => item.keyword == keyword.name);
      if (data) {
        keyword.searchVolume =
          data.monthly_searches?.length > 0
            ? data.monthly_searches[0].search_volume
            : 0;
        keyword.cpc = data.cpc ?? 0;
        keyword.competitionIndex = data.competition_index ?? 0;
      }
    }
    await this.keywordRepository.save(keywords);
  }

  /**
   * Fetches a paginated list of keywords associated with a project.
   *
   * @param {GetProjectKeywordsType} payload - The payload containing the project identifier
   *                                             and any additional filtering criteria.
   * @param {PaginatedSearchRequest} options - The options for pagination including page number,
   *                                            page size, and sorting preferences.
   * @return {Promise<Pagination<KeywordEntity>>} A promise that resolves to a Pagination object
   *                                               containing the list of KeywordEntity.
   */
  async paginatedProjectKeywords(
    payload: GetProjectKeywordsType,
    options: PaginatedSearchRequest,
  ): Promise<Pagination<KeywordEntity>> {
    return this.keywordRepository.paginatedKeywordsByProjectId(
      payload,
      options,
    );
  }

  /**
   * Updates the positions of keywords specified by their IDs for a given account.
   *
   * @param {IdType} accountId - The ID of the account for which keyword positions are to be updated.
   * @param {IdType[]} keywordIds - An array of keyword IDs whose positions are to be updated.
   * @return {Promise<void>} A promise that resolves when the keyword positions update operation is complete.
   */
  async updateKeywordPositionsByKeywordIds(
    accountId: IdType,
    keywordIds: IdType[],
  ): Promise<void> {
    const keywords = await this.keywordRepository.getKeywordsByIds(keywordIds);
    if (keywords.length === 0) {
      return;
    }

    await this.updatePositions(
      await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
        accountId,
        keywords,
      ),
      accountId,
    );
  }

  /**
   * Updates the positions of keywords that missed updates for Baidu.
   *
   * This method retrieves all keyword IDs that missed updates in the Baidu search engine from the
   * keyword repository. If any keyword IDs are found, it publishes an event to update the positions
   * of these keywords using the standard queue for Baidu.
   *
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updatingKeywordsThatMissedUpdatesForBaidu(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.Baidu,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueForBaiduEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );

      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * Updates keywords that missed updates specifically for Yahoo.
   *
   * This method fetches all the keyword IDs that have missed updates for
   * the Yahoo search engine from the repository. If there are any such
   * keywords, an update event is published to handle updating their positions.
   *
   * @return {Promise<void>} A promise that resolves when the updating process is complete.
   */
  async updatingKeywordsThatMissedUpdatesForYahoo(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.Yahoo,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueForYahooEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );

      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * Updates keywords that missed updates for the Bing search engine.
   * This method retrieves keyword IDs from the repository that missed updates
   * and publishes an event to update the keyword positions using a standard queue for Bing.
   *
   * @return {Promise<void>} A promise that resolves when the keywords have been processed.
   */
  async updatingKeywordsThatMissedUpdatesForBing(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.Bing,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueForBingEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * This method retrieves the keywords that missed updates for YouTube from the repository.
   * If there are any such keywords, it publishes an event to update their positions using a standard queue.
   *
   * @return {Promise<void>} A promise that resolves when the method completes.
   */
  async updatingKeywordsThatMissedUpdatesForYoutube(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.YouTube,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );

      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * Updates the keyword positions for those that missed updates specifically for Google Maps.
   *
   * @return {Promise<void>} A promise that resolves when the update process is completed.
   */
  async updatingKeywordsThatMissedUpdatesForGoogleMaps(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.GoogleMaps,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );

      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * This method identifies keywords related to Google My Business that missed updates
   * and initiates an update process for their positions using a standard queue event.
   *
   * @return {Promise<void>} A promise that resolves when the update process is initiated.
   */
  async updatingKeywordsThatMissedUpdatesForGoogleLocal(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.GoogleMyBusiness,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * Updates keywords that missed updates by retrieving keyword IDs from a specified search engine
   * repository and publishing an event to update their positions.
   *
   * @return {Promise<void>} A promise that resolves once the update process is complete.
   */
  async updateKeywordsThatMissedUpdates(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsBySearchEngineThatMissedUpdates(
        SearchEnginesEnum.Google,
      );
    if (keywordIds.length > 0) {
      this.eventBus.publish(
        new UpdateKeywordPositionsUsingStandardQueueEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds.map((keyword) => keyword.id),
        }),
      );
    }
  }

  /**
   * Updates keyword positions for periods for Baidu.
   *
   * This method retrieves a list of keywords scheduled for update from the keyword repository for the Baidu search engine.
   * It then groups these keywords by their account IDs and processes each group to ensure they adhere to account-specific daily limits.
   * If there are keywords to be updated, it publishes an event to update the keyword positions using a standard queue.
   *
   * @return {Promise<void>} A promise that resolves when the keyword positions have been updated.
   */
  async updateKeywordPositionsForPeriodsForBaidu(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.Baidu,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueForBaiduEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );

          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Updates the positions of keywords for the Yahoo search engine for given periods by fetching the relevant keyword IDs,
   * applying account limits, and publishing an event for further processing.
   *
   * @return {Promise<void>} A promise that resolves when the keyword positions are successfully updated.
   */
  async updateKeywordPositionsForPeriodsForYahoo(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.Yahoo,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueForYahooEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );

          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Updates keyword positions for specific periods for Bing search engine.
   * This method fetches the keywords scheduled for update, groups them by account,
   * limits the update frequencies according to daily quotas, and then publishes an event
   * to update the keyword positions via the standard queue for Bing.
   *
   * @return {Promise<void>} A promise that resolves when the update process is complete.
   */
  async updateKeywordPositionsForPeriodsForBing(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.Bing,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueForBingEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );

          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Updates the positions of keywords for specified periods in the YouTube search engine.
   * It retrieves keywords scheduled for updates, limits the updates according to daily quotas,
   * and publishes an event to update keyword positions using a queue.
   *
   * @return {Promise<void>} A promise that resolves when the update process is complete.
   */
  async updateKeywordPositionsForPeriodsForYoutube(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.YouTube,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length * 5,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Update keyword positions for a given period for Google Maps.
   * This function fetches keywords scheduled for an update from a specific search engine,
   * groups them by account, applies a daily update limit per account, and triggers
   * an event to update the keyword positions on Google Maps.
   *
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async updateKeywordPositionsForPeriodsForGoogleMaps(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.GoogleMaps,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Updates keyword positions for pre-defined periods specific to Google Local search engine.
   * This method retrieves a list of keyword IDs scheduled for update for Google My Business,
   * organizes them by account, and then processes them to ensure they respect daily update limits.
   * Once limits are respected, it dispatches an event to update keyword positions using an appropriate queue.
   *
   * @return {Promise<void>} A promise that resolves when the update process is complete.
   */
  async updateKeywordPositionsForPeriodsForGoogleLocal(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.GoogleMyBusiness,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length * 5,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Updates the positions of keywords for specified periods using Google as the search engine.
   *
   * This method retrieves the keywords scheduled for an update, groups them by account ID, and
   * limits the updates according to the daily limit for each account. After updating the keyword
   * positions, the method adjusts the quota for keyword updates and publishes an event to
   * proceed with the updated positions.
   *
   * @return {Promise<void>} A promise that resolves when the keyword positions have been updated and events have been published.
   */
  async updateKeywordPositionsForPeriods(): Promise<void> {
    const keywordIds =
      await this.keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate(
        SearchEnginesEnum.Google,
      );
    if (keywordIds.length > 0) {
      const result: { account_id: IdType; ids: IdType[] }[] = Object.values(
        keywordIds.reduce(
          (acc: any, obj: { account_id: IdType; id: IdType }) => {
            const { id, account_id } = obj;
            acc[account_id] = acc[account_id] || { account_id, ids: [] };
            acc[account_id].ids.push(id);
            return acc;
          },
          {},
        ),
      );
      for (const item of result) {
        const keywords =
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            item.account_id,
            item.ids.map((id: IdType) => {
              return { id } as KeywordEntity;
            }),
          );

        if (keywords.length > 0) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            item.account_id,
            keywords.length,
          );
          this.eventBus.publish(
            new UpdateKeywordPositionsUsingStandardQueueEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );

          await this.eventBus.publish(
            new CreateTriggerInitializationEvent({
              keywordIds: keywords.map((keyword) => keyword.id),
            }),
          );
        }
      }
    }
  }

  /**
   * Retrieves a keyword based on the provided payload.
   *
   * @param {GetKeywordType} payload - The data necessary to retrieve the keyword.
   * @param {string} payload.accountId - The ID of the account to which the keyword is related.
   * @param {string} payload.keywordId - The ID of the keyword to be retrieved.
   * @param {Object} payload.user - The user requesting the keyword.
   * @param {string} payload.user.id - The ID of the user.
   *
   * @return {Promise<GetKeywordResponse>} - A promise resolving to the keyword response.
   * @throws {NotFoundException} - Throws if the keyword is not found.
   */
  async getKeyword(payload: GetKeywordType): Promise<GetKeywordResponse> {
    await this.checkIfKeywordsAreRelatedToUserAccount(
      payload.accountId,
      [payload.keywordId],
      payload.user.id,
    );
    const keyword = await this.keywordRepository.getKeywordById(
      payload.keywordId,
    );
    if (!keyword) {
      throw new NotFoundException('Keyword not found.');
    }
    return this.getKeywordResponseFactory.createResponse(keyword);
  }

  /**
   * Searches for results based on the provided payload and options.
   *
   * @param {SearchResultsType} payload - The search query, including accountId, keywordId, and userId.
   * @param {SearchResultsRequest} options - The search options, including pagination information.
   * @return {Promise<SearchResultsResponse>} - Promise resolving to a response containing search results and metadata.
   */
  async searchResults(
    payload: SearchResultsType,
    options: SearchResultsRequest,
  ): Promise<SearchResultsResponse> {
    await this.checkIfKeywordsAreRelatedToUserAccount(
      payload.accountId,
      [payload.keywordId],
      payload.userId,
    );
    const keyword =
      await this.keywordRepository.getKeywordWithLastPositionByKeywordId(
        payload.keywordId,
      );
    if (!keyword) {
      throw new NotFoundException('Keyword not found.');
    }

    const lastKeywordPosition =
      keyword.keywordPositionsForDay.length > 0
        ? Number(keyword.keywordPositionsForDay[0].position)
        : 0;
    const result =
      await this.searchResultRepository.getLastSearchResultByKeywordId(
        payload.keywordId,
      );
    const itemsPerPage = options.limit ? Number(options.limit) : 10;
    if (result) {
      const data = paginate(
        result.result,
        lastKeywordPosition,
        itemsPerPage,
        options.page ?? null,
      );
      if (data?.items && data.items.length === 0) {
        const meta = {
          itemCount: 0,
          totalItems: 0,
          itemsPerPage,
          totalPage: 0,
          currentPage: 1,
        };
        return this.searchResultsResponseFactory.createResponse([], meta);
      } else {
        return this.searchResultsResponseFactory.createResponse(
          data.items,
          data.meta,
        );
      }
    } else {
      const meta = {
        itemCount: 0,
        totalItems: 0,
        itemsPerPage,
        totalPage: 0,
        currentPage: 1,
      };
      return this.searchResultsResponseFactory.createResponse([], meta);
    }
  }

  /**
   * Updates the positions for Baidu search engine based on the provided keywords.
   *
   * @param {KeywordEntity[]} keywords - An array of KeywordEntity objects whose positions need to be updated.
   * @return {Promise<void>} A promise that resolves when the keyword positions are successfully queued for update.
   */
  async updatePositionsForBaidu(keywords: KeywordEntity[]): Promise<void> {
    if (keywords.length === 0) {
      return;
    }

    await this.updateKeywordPositionQueue.add(
      QueueEventEnum.ManualKeywordUpdatesForBaidu,
      {
        keywordIds: keywords.map((keyword) => keyword.id),
        isManual: true,
      },
    );
  }

  async updatePositionsForYoutube(
    updatedKeywords: KeywordEntity[],
    accountId: IdType,
  ): Promise<void> {
    if (updatedKeywords.length === 0) {
      return;
    }
    let counter = 0;
    const manualKeywordIds = [];
    const promises = [];
    const liveModeKeywordIds = [];

    const updatedKeywordIds = updatedKeywords.map((item) => item.id);
    const keywords =
      await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
        accountId,
        updatedKeywords,
      );

    const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
      updatedKeywordIds,
      keywords,
    );

    if (keywordsForPriorityQueue.length > 0) {
      manualKeywordIds.push(...keywordsForPriorityQueue);
    }

    for (const keyword of keywords) {
      counter++;
      if (counter <= 100) {
        const result = this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesInLiveModeForYoutube,
          {
            keywordId: keyword.id,
            isManual: true,
          },
        );
        liveModeKeywordIds.push(keyword.id);
        promises.push(result);
      } else {
        manualKeywordIds.push(keyword.id);
      }
    }
    if (liveModeKeywordIds.length) {
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        liveModeKeywordIds,
      );
      for (const project of result) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length * 5,
        );
      }
      await this.eventBus.publish(
        new StartOfKeywordUpdateEvent({
          keywordIds: liveModeKeywordIds,
        }),
      );
    }
    if (manualKeywordIds.length > 0) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.ManualKeywordUpdatesForYoutube,
        {
          keywordIds: manualKeywordIds,
          isManual: true,
        },
      );
    }
  }

  async updatePositionsForYahoo(
    updatedKeywords: KeywordEntity[],
    accountId: IdType,
  ): Promise<void> {
    if (updatedKeywords.length === 0) {
      return;
    }
    let counter = 0;
    const manualKeywordIds = [];
    const promises = [];
    const liveModeKeywordIds = [];

    const updatedKeywordIds = updatedKeywords.map((item) => item.id);
    const keywords =
      await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
        accountId,
        updatedKeywords,
      );

    const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
      updatedKeywordIds,
      keywords,
    );

    if (keywordsForPriorityQueue.length > 0) {
      manualKeywordIds.push(...keywordsForPriorityQueue);
    }
    for (const keyword of keywords) {
      counter++;
      if (counter <= 100) {
        const result = this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesInLiveModeForYahoo,
          {
            keywordId: keyword.id,
            isManual: true,
          },
        );
        liveModeKeywordIds.push(keyword.id);
        promises.push(result);
      } else {
        manualKeywordIds.push(keyword.id);
      }
    }
    if (liveModeKeywordIds.length) {
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        liveModeKeywordIds,
      );
      for (const project of result) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length,
        );
      }
      await this.eventBus.publish(
        new StartOfKeywordUpdateEvent({
          keywordIds: liveModeKeywordIds,
        }),
      );
    }
    if (manualKeywordIds.length > 0) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.ManualKeywordUpdatesForYahoo,
        {
          keywordIds: manualKeywordIds,
          isManual: true,
        },
      );
    }
  }

  async updatePositionsForBing(
    updatedKeywords: KeywordEntity[],
    accountId: IdType,
  ): Promise<void> {
    if (updatedKeywords.length === 0) {
      return;
    }
    let counter = 0;
    const manualKeywordIds = [];
    const promises = [];
    const liveModeKeywordIds = [];
    const updatedKeywordIds = updatedKeywords.map((item) => item.id);
    const keywords =
      await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
        accountId,
        updatedKeywords,
      );

    const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
      updatedKeywordIds,
      keywords,
    );

    if (keywordsForPriorityQueue.length > 0) {
      manualKeywordIds.push(...keywordsForPriorityQueue);
    }
    for (const keyword of keywords) {
      counter++;
      if (counter <= 100) {
        const result = this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesInLiveModeForBing,
          {
            keywordId: keyword.id,
            isManual: true,
          },
        );
        liveModeKeywordIds.push(keyword.id);
        promises.push(result);
      } else {
        manualKeywordIds.push(keyword.id);
      }
    }
    if (liveModeKeywordIds.length) {
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        liveModeKeywordIds,
      );
      for (const project of result) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length,
        );
        await this.accountLimitsService.takeIntoAccountQuotaOfLiveModeUpdatesPerDay(
          project.account.id,
          project.keywords.length,
        );
      }
      await this.eventBus.publish(
        new StartOfKeywordUpdateEvent({
          keywordIds: liveModeKeywordIds,
        }),
      );
    }
    if (manualKeywordIds.length > 0) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.ManualKeywordUpdatesForBing,
        {
          keywordIds: manualKeywordIds,
          isManual: true,
        },
      );
    }
  }

  async updatePositionsForGoogleMaps(
    updatedKeywords: KeywordEntity[],
    accountId: IdType,
  ): Promise<void> {
    if (updatedKeywords.length === 0) {
      return;
    }
    let counter = 0;
    const manualKeywordIds = [];
    const promises = [];
    const liveModeKeywordIds = [];

    const updatedKeywordIds = updatedKeywords.map((item) => item.id);
    const keywords =
      await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
        accountId,
        updatedKeywords,
      );

    const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
      updatedKeywordIds,
      keywords,
    );

    if (keywordsForPriorityQueue.length > 0) {
      manualKeywordIds.push(...keywordsForPriorityQueue);
    }
    for (const keyword of keywords) {
      counter++;
      if (counter <= 100) {
        const result = this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleMaps,
          {
            keywordId: keyword.id,
            isManual: true,
          },
        );
        liveModeKeywordIds.push(keyword.id);
        promises.push(result);
      } else {
        manualKeywordIds.push(keyword.id);
      }
    }
    if (liveModeKeywordIds.length) {
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        liveModeKeywordIds,
      );
      for (const project of result) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length,
        );
        await this.accountLimitsService.takeIntoAccountQuotaOfLiveModeUpdatesPerDay(
          project.account.id,
          project.keywords.length,
        );
      }
      await this.eventBus.publish(
        new StartOfKeywordUpdateEvent({
          keywordIds: liveModeKeywordIds,
        }),
      );
    }
    if (manualKeywordIds.length > 0) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.ManualKeywordUpdatesForGoogleMaps,
        {
          keywordIds: manualKeywordIds,
          isManual: true,
        },
      );
    }
  }

  async updatePositionsForGoogleLocal(
    updatedKeywords: KeywordEntity[],
    accountId: IdType,
  ): Promise<void> {
    if (updatedKeywords.length === 0) {
      return;
    }
    let counter = 0;
    const manualKeywordIds = [];
    const promises = [];
    const liveModeKeywordIds = [];

    const updatedKeywordIds = updatedKeywords.map((item) => item.id);
    const keywords =
      await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
        accountId,
        updatedKeywords,
      );

    const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
      updatedKeywordIds,
      keywords,
    );

    if (keywordsForPriorityQueue.length > 0) {
      manualKeywordIds.push(...keywordsForPriorityQueue);
    }
    for (const keyword of keywords) {
      counter++;
      if (counter <= 100) {
        const result = this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleLocal,
          {
            keywordId: keyword.id,
            isManual: true,
          },
        );
        liveModeKeywordIds.push(keyword.id);
        promises.push(result);
      } else {
        manualKeywordIds.push(keyword.id);
      }
    }
    if (liveModeKeywordIds.length) {
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        liveModeKeywordIds,
      );
      for (const project of result) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length * 5,
        );
        await this.accountLimitsService.takeIntoAccountQuotaOfLiveModeUpdatesPerDay(
          project.account.id,
          project.keywords.length,
        );
      }
      await this.eventBus.publish(
        new StartOfKeywordUpdateEvent({
          keywordIds: liveModeKeywordIds,
        }),
      );
    }
    if (manualKeywordIds.length > 0) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.ManualKeywordUpdatesForGoogleLocal,
        {
          keywordIds: manualKeywordIds,
          isManual: true,
        },
      );
    }
  }

  async updatePositions(
    updatedKeywords: KeywordEntity[],
    accountId: IdType,
  ): Promise<void> {
    if (updatedKeywords.length === 0) {
      return;
    }
    let counter = 0;
    const manualKeywordIds = [];
    const promises = [];
    const liveModeKeywordIds = [];

    const updatedKeywordIds = updatedKeywords.map((item) => item.id);
    const keywords =
      await this.accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit(
        accountId,
        updatedKeywords,
      );

    const keywordsForPriorityQueue = await this.findIdsNotInSecondArray(
      updatedKeywordIds,
      keywords,
    );

    if (keywordsForPriorityQueue.length > 0) {
      manualKeywordIds.push(...keywordsForPriorityQueue);
    }
    for (const keyword of keywords) {
      counter++;
      if (counter <= 100) {
        const result = this.updateKeywordPositionQueue.add(
          QueueEventEnum.ManualKeywordUpdatesInLiveMode,
          {
            keywordId: keyword.id,
            isManual: true,
          },
        );
        liveModeKeywordIds.push(keyword.id);
        promises.push(result);
      } else {
        manualKeywordIds.push(keyword.id);
      }
    }
    if (liveModeKeywordIds.length) {
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        liveModeKeywordIds,
      );
      for (const project of result) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length,
        );
        await this.accountLimitsService.takeIntoAccountQuotaOfLiveModeUpdatesPerDay(
          project.account.id,
          project.keywords.length,
        );
      }
      await this.eventBus.publish(
        new StartOfKeywordUpdateEvent({
          keywordIds: liveModeKeywordIds,
        }),
      );
    }
    if (manualKeywordIds.length > 0) {
      await this.updateKeywordPositionQueue.add(
        QueueEventEnum.ManualKeywordUpdates,
        {
          keywordIds: manualKeywordIds,
          isManual: true,
        },
      );
    }
  }

  /**
   * Finds IDs from the first array that are not present in the ID field of objects in the second array.
   *
   * @param {IdType[]} ids - The array of IDs to check.
   * @param {KeywordEntity[]} objects - The array of objects, each containing an ID field, to compare against.
   * @return {Promise<IdType[]>} A promise that resolves to an array of IDs that are in the first array but not in the second array's objects.
   */
  async findIdsNotInSecondArray(
    ids: IdType[],
    objects: KeywordEntity[],
  ): Promise<IdType[]> {
    if (objects.length === 0) {
      return ids;
    }

    const objectIds = objects.map((item) => item.id);

    return ids.filter((id) => !objectIds.includes(id));
  }

  /**
   * Deletes specified keywords associated with a project.
   *
   * @param {Object} payload - The data required to delete project keywords.
   * @param {string} payload.accountId - The account ID associated with the project.
   * @param {string} payload.projectId - The project ID from which keywords should be deleted.
   * @param {Array<string>} payload.keywordIds - The IDs of the keywords to be deleted.
   * @param {Object} payload.user - The user performing the deletion.
   * @param {string} payload.user.id - The ID of the user performing the deletion.
   *
   * @return {Promise<void>} A promise that resolves when the keywords have been deleted.
   */
  @Transactional()
  async deleteProjectKeywords(payload: DeleteKeywordsType): Promise<void> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.user.id,
    );

    const keywords = await this.keywordRepository.getKeywordsByIdsAndRelations(
      payload.keywordIds,
      payload.accountId,
      payload.projectId,
    );

    if (keywords.length !== payload.keywordIds.length) {
      throw new BadRequestException('Keywords not found.');
    }
    await this.competitorsService.deleteKeywordPositionsByKeywordIds(
      payload.keywordIds,
    );
    await this.keywordsPositionsService.deleteKeywordPositionsByKeywordIds(
      payload.keywordIds,
    );
    await this.keywordRepository.remove(keywords);

    this.eventBus.publish(
      new RemoteProjectsEvent({
        accountId: payload.accountId,
        projectIds: [payload.projectId],
      }),
    );
  }

  /**
   * Get the number of keywords available for update.
   *
   * @param {GetNumberOfAvailableKeywordsToUpdateType} payload - The payload containing account ID, keyword IDs, and user ID.
   * @return {Promise<GetNumberOfAvailableKeywordsToUpdateResponse>} - The response containing the number of keywords available for update.
   */
  async getNumberOfAvailableKeywordsToUpdate(
    payload: GetNumberOfAvailableKeywordsToUpdateType,
  ): Promise<GetNumberOfAvailableKeywordsToUpdateResponse> {
    await this.checkIfKeywordsAreRelatedToUserAccount(
      payload.accountId,
      payload.keywordIds,
      payload.userId,
    );

    const keywordCount =
      await this.keywordRepository.getNumberOfAvailableKeywordsToUpdate(
        payload.keywordIds,
      );
    return new GetNumberOfAvailableKeywordsToUpdateResponse({
      keywordCount: payload.keywordIds.length - keywordCount,
    });
  }
  /**
   * Updates the positions of keywords based on the specified search engine.
   *
   * @param {UpdateKeywordPositionsType} payload - The payload containing account, project, and keyword information for the update.
   * @return {Promise<void>} Promise that resolves when the keyword positions are updated.
   */
  async updateKeywordPositions(
    payload: UpdateKeywordPositionsType,
  ): Promise<void> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.user.id,
    );
    const project = await this.projectRepository.getProjectByIdWithSearchEngine(
      payload.projectId,
    );
    const keywords = await this.keywordRepository.getKeywordsForManualUpdate(
      payload.keywordIds,
    );
    switch (project.searchEngine.name) {
      case SearchEnginesEnum.Google:
        await this.updatePositions(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
          ),
          payload.accountId,
        );
        break;
      case SearchEnginesEnum.GoogleMyBusiness:
        await this.updatePositionsForGoogleLocal(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
            5,
          ),
          payload.accountId,
        );
        break;

      case SearchEnginesEnum.GoogleMaps:
        await this.updatePositionsForGoogleMaps(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
          ),
          payload.accountId,
        );
        break;
      case SearchEnginesEnum.Bing:
        await this.updatePositionsForBing(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
          ),
          payload.accountId,
        );
        break;

      case SearchEnginesEnum.Yahoo:
        await this.updatePositionsForYahoo(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
          ),
          payload.accountId,
        );
        break;
      case SearchEnginesEnum.Baidu:
        await this.updatePositionsForBaidu(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
          ),
        );
        break;

      case SearchEnginesEnum.YouTube:
        await this.updatePositionsForYoutube(
          await this.accountLimitsService.limitKeywordUpdatesToADailyLimit(
            payload.accountId,
            keywords,
            5,
          ),
          payload.accountId,
        );
        break;
      default:
        throw new BadRequestException('Search Engine not defined');
    }

    await this.projectsQueue.add(
      QueueEventEnum.UpdateProjectSchedules,
      {
        projectId: project.id,
      },
      {
        jobId: `update-project-${project.id}`,
        removeOnComplete: true,
        removeOnFail: true,
        delay: 6000,
      },
    );
  }

  /**
   * Retrieves the performance data for a given project over a specified period of time.
   *
   * @param {GetProjectPerformanceType} payload - The input parameters containing projectId, period, deviceType, etc.
   * @returns {Promise<ProjectPerformanceResponse>} A promise that resolves to the project's performance data.
   */
  async getProjectPerformance(
    payload: GetProjectPerformanceType,
  ): Promise<ProjectPerformanceResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const toDate = moment().add(1, 'd').format('YYYY-MM-DD');
    const fromDate = getStartDate(payload.period);
    const projectPerformance =
      await this.projectPerformanceCacheTransformer.cache({
        projectId: payload.projectId,
        fromDate,
        toDate,
        deviceType: payload.deviceType,
      });
    const notes = await this.notesService.getNotesProjectByDate({
      projectId: payload.projectId,
      fromDate,
      toDate,
    });
    const competitorsProjectPerformance =
      payload?.competitorIds?.length > 0
        ? await this.competitorsService.getProjectPerformanceByCompetitorIds(
            payload.projectId,
            payload.competitorIds,
            fromDate,
            toDate,
            payload.deviceType,
          )
        : new CompetitorsProjectPerformanceResponse({ items: [] });

    return new ProjectPerformanceResponse({
      dailyAveragePosition: new DailyAveragePositionsResponse({
        items: projectPerformance.map(
          (item) => new DailyAveragePositionResponse({ ...item }),
        ),
      }),
      notes: new NotesResponse({
        items: notes.map(
          (item) =>
            new NoteResponse({
              ...item,
              author: item.author.email,
              date: item.createdAt,
              projectId: item.project.id,
            }),
        ),
      }),
      competitorsProjectPerformance: competitorsProjectPerformance,
    });
  }

  /**
   * Checks if a user has access to all given projects in relation to a specified account.
   *
   * @param {IdType} accountId - The ID of the account to check against.
   * @param {IdType[]} projectIds - An array of project IDs to check access for.
   * @param {IdType} [userId] - The ID of the user requesting access, optional.
   * @return {Promise<void>} - A promise that resolves if access is granted, otherwise throws an exception.
   * @throws {ForbiddenException} - Throws if access is denied to any of the specified projects.
   */
  async checkAttitudeOfAccount(
    accountId: IdType,
    projectIds: IdType[],
    userId?: IdType,
  ): Promise<void> {
    const projects =
      await this.projectRepository.getUserAvailableProjectsInRelationToAccount(
        accountId,
        projectIds,
        userId,
      );
    if (projects.length === 0) {
      throw new ForbiddenException('Access denied.');
    }
    if (projects.length !== projectIds.length) {
      throw new ForbiddenException('Access denied.');
    }
  }

  /**
   * Fetches keyword rankings based on the provided payload and options.
   *
   * @param {KeywordRankingsType} payload - The data related to the keyword rankings request including accountId, projectId, and userId.
   * @param {KeywordRankingsRequest} options - The options for fetching keyword rankings, including pagination, search, sorting, filters, and device type.
   * @return {Promise<KeywordRankingsResponse>} - A promise that resolves to the keyword rankings response containing the rankings data and metadata.
   */
  async getKeywordRankings(
    payload: KeywordRankingsType,
    options: KeywordRankingsRequest,
  ): Promise<KeywordRankingsResponse> {
    await this.checkAttitudeOfAccount(
      payload.accountId,
      [payload.projectId],
      payload.userId,
    );
    const { items, meta } =
      await this.keywordRepository.getKeywordsWithKeywordPositions(
        payload.projectId,
        {
          page: options.page,
          limit: options.limit,
          search: options.search,
          sortBy: options.sortBy as SortKeywordRankingsEnum,
          sortOrder: options.sortOrder,
        },
        {
          top3: options.top3,
          top10: options.top10,
          top30: options.top30,
          top100: options.top100,
          improved: options.improved,
          declined: options.declined,
          notRanked: options.notRanked,
          noChange: options.noChange,
          lost: options.lost,
          tagIds: options.tagIds,
        },
        options.deviceType,
      );

    return this.keywordRankingsResponseFactory.createResponse(items, { meta });
  }

  /**
   * Fetches the position history of a given keyword for a user account within a specified period.
   *
   * @param {PositionHistoryType} payload - The payload containing details such as accountId, keywordId, period, userId, and competitorIds.
   * @return {Promise<PositionHistoryResponse>} A promise that resolves to a PositionHistoryResponse object containing the keyword position history and competitor position history.
   */
  async getPositionHistory(
    payload: PositionHistoryType,
  ): Promise<PositionHistoryResponse> {
    await this.checkIfKeywordsAreRelatedToUserAccount(
      payload.accountId,
      [payload.keywordId],
      payload.userId,
    );
    const now = moment().add(1, 'd').format('YYYY-MM-DD');
    const fromDate = getStartDate(payload.period);
    const positionHistory = await this.positionHistoryCacheTransformer.cache({
      keywordId: payload.keywordId,
      fromDate,
      toDate: now,
    });
    const competitors =
      payload?.competitorIds?.length > 0
        ? await this.competitorsService.getPositionHistory(
            payload.keywordId,
            now,
            fromDate,
            payload.competitorIds,
          )
        : [];

    return new PositionHistoryResponse({
      positionHistory: positionHistory.map(
        (item) =>
          new HistoryResponse({
            date: item.updateDate,
            position: +item.position === 0 ? 101 : +item.position,
          }),
      ),
      historyOfCompetitorPositions: competitors,
    });
  }

  /**
   * Fetches the keyword trends based on the provided criteria.
   *
   * @param {GetKeywordTrendsType} payload - The criteria used to fetch the keyword trends, including projectId, period, and deviceType.
   * @return {Promise<KeywordTrendType[]>} A promise that resolves to an array of keyword trend data.
   */
  async getKeywordTrends(
    payload: GetKeywordTrendsType,
  ): Promise<KeywordTrendType[]> {
    const now = moment().add(1, 'd').format('YYYY-MM-DD');
    const fromDate = getStartDate(payload.period);
    return this.keywordTrendsCacheTransformer.cache({
      projectId: payload.projectId,
      fromDate,
      toDate: now,
      deviceType: payload.deviceType,
    });
  }

  /**
   * Retrieves keywords by their IDs and the project ID.
   *
   * @param {IdType[]} ids - Array of keyword IDs to be retrieved.
   * @param {IdType} projectId - The ID of the project to which the keywords belong.
   * @return {Promise<KeywordEntity[]>} - A promise that resolves to an array of KeywordEntity objects.
   */
  async getKeywordsByIdsAndProjectId(
    ids: IdType[],
    projectId: IdType,
  ): Promise<KeywordEntity[]> {
    return this.keywordRepository.getKeywordsByIdsAndProjectId(ids, projectId);
  }

  /**
   * Generates statistics for improved versus declined metrics based on the given payload.
   *
   * @param {ImprovedVsDeclinedType} payload - An object containing the necessary parameters such as projectId, period, and deviceType.
   * @return {Promise<GetStatisticsType[]>} A promise that resolves to an array of statistics.
   */
  async improvedVsDeclined(
    payload: ImprovedVsDeclinedType,
  ): Promise<GetStatisticsType[]> {
    const now = moment().add(1, 'd').format('YYYY-MM-DD');
    const fromDate = getStartDate(payload.period);
    return this.improvedVsDeclinedCacheTransformer.cache({
      projectId: payload.projectId,
      fromDate,
      toDate: now,
      deviceType: payload.deviceType,
    });
  }

  /**
   * Provides an overview of a project, either within a specified date range or defaulting to the
   * dates of the last project update.
   *
   * @param {ProjectOverviewType} payload - The input data for generating the project overview.
   * May include optional fromDate and toDate properties to specify a date range.
   * @return {Promise<OverviewType>} A promise that resolves to the transformed project overview
   * data, based on the provided or derived date range.
   */
  async overview(payload: ProjectOverviewType): Promise<OverviewType> {
    if (payload.fromDate && payload.toDate) {
      return this.overviewCacheTransformer.cache({
        ...payload,
        fromDate: payload.fromDate,
        toDate: payload.toDate,
      });
    } else {
      const lastOverview =
        await this.latestProjectOverviewRepository.getCurrentDatesOfLastProjectUpdate(
          payload.projectId,
        );
      if (!lastOverview) {
        return this.overviewCacheTransformer.cache({
          ...payload,
          fromDate: moment().subtract(1, 'days').toString(),
          toDate: moment().toString(),
        });
      } else {
        return this.overviewCacheTransformer.cache({
          ...payload,
          fromDate: lastOverview.previousUpdateDate.toString(),
          toDate: lastOverview.updateDate.toString(),
        });
      }
    }
  }

  /**
   * Calculates the number of words that will be skipped for the given project IDs.
   *
   * @param {IdType[]} projectIds - An array of project IDs for which to count the skipped words.
   * @return {Promise<number>} - A promise that resolves to the number of words that will be skipped.
   */
  async getNumberOfWordsThatWillBeSkipped(
    projectIds: IdType[],
  ): Promise<number> {
    const numberOfKeywordsToBeUpdated =
      await this.keywordRepository.getNumberOfProjectsKeywordsToUpdate(
        projectIds,
      );
    const allKeywords =
      await this.keywordRepository.getNumberOfProjectsKeywords(projectIds);
    return allKeywords - numberOfKeywordsToBeUpdated;
  }
}
