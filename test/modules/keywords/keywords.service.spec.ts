import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { jest } from '@jest/globals';
import { getQueueToken } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { KeywordsPositionsService } from 'modules/keywords/services/keywords-positions.service';
import { CompetitorsService } from 'modules/competitors/services/competitors.service';
import { KeywordRankingsResponseFactory } from 'modules/keywords/factories/keyword-rankings-response.factory';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { SearchResultsResponseFactory } from 'modules/keywords/factories/search-results-response.factory';
import { NotesService } from 'modules/notes/services/notes.service';
import { OverviewCacheTransformer } from 'modules/cache/transformers/overview.cache-transformer';
import { LatestProjectOverviewRepository } from 'modules/projects/repositories/latest-project-overview.repository';
import { ImprovedVsDeclinedCacheTransformer } from 'modules/cache/transformers/improved-vs-declined.cache-transformer';
import { KeywordTrendsCacheTransformer } from 'modules/cache/transformers/keyword-trends.cache-transformer';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { PositionHistoryCacheTransformer } from 'modules/cache/transformers/position-history.cache-transformer';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { GetKeywordResponseFactory } from 'modules/keywords/factories/get-keyword-response.factory';
import {
  accountEntityMock,
  accountEntitySecondMock,
} from '../../mocks/entities/account-entity.mock';
import { userEntityMock } from '../../mocks/entities/user-entity.mock';
import {
  keywordTest1Mock,
  keywordTest2Mock,
  keywordTest3Mock,
} from '../../mocks/entities/keyword-entity.mock';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { UpdateKeywordPositionsUsingStandardQueueForBaiduEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-baidu.event';
import { UpdateKeywordPositionsUsingStandardQueueForYahooEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-yahoo.event';
import { UpdateKeywordPositionsUsingStandardQueueForBingEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-bing.event';
import { UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-youtube.event';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-google-maps.event';
import { UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue-for-google-local.event';
import { UpdateKeywordPositionsUsingStandardQueueEvent } from 'modules/keywords/events/update-keyword-positions-using-standard-queue.event';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { StartOfKeywordUpdateEvent } from 'modules/keywords/events/start-of-keyword-update.event';
import {
  projectOneEntityMock,
  projectTwoEntityMock,
} from '../../mocks/entities/project-entity.mock';
import { RemoteProjectsEvent } from 'modules/projects/events/remote-projects.event';
import { GetNumberOfAvailableKeywordsToUpdateResponse } from 'modules/keywords/responses/get-number-of-available-keywords-to-update.response';
import { CompetitorsProjectPerformanceResponse } from 'modules/competitors/responses/competitors-project-performance.response';
import { PositionHistoryResponse } from 'modules/keywords/responses/position-history.response';
import moment from 'moment';
import * as helper from 'modules/keywords/helpers/getStartDate';

jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

describe('KeywordsService', () => {
  let keywordsService: KeywordsService;
  let keywordRepository: KeywordRepository;
  let eventBus: EventBus;
  let accountLimitsService: AccountLimitsService;
  let getKeywordResponseFactory: GetKeywordResponseFactory;
  let searchResultRepository: SearchResultRepository;
  let searchResultsResponseFactory: SearchResultsResponseFactory;
  let updateKeywordPositionQueue: Queue;
  let projectsQueue: Queue;
  let projectRepository: ProjectRepository;
  let competitorsService: CompetitorsService;
  let keywordsPositionsService: KeywordsPositionsService;
  let projectPerformanceCacheTransformer: ProjectPerformanceCacheTransformer;
  let notesService: NotesService;
  let keywordRankingsResponseFactory: KeywordRankingsResponseFactory;
  let positionHistoryCacheTransformer: PositionHistoryCacheTransformer;
  let keywordTrendsCacheTransformer: KeywordTrendsCacheTransformer;
  let improvedVsDeclinedCacheTransformer: ImprovedVsDeclinedCacheTransformer;
  let overviewCacheTransformer: OverviewCacheTransformer;
  let latestProjectOverviewRepository: LatestProjectOverviewRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordsService,
        {
          provide: EventBus,
          useValue: {
            setModuleRef: jest.fn(),
            register: jest.fn(),
            publish: jest.fn(),
          },
        },
        {
          provide: getQueueToken(Queues.UpdateKeywordPosition),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: getQueueToken(Queues.Projects),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: KeywordRepository,
          useValue: {
            allowManualUpdateForKeywords: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            getKeywordsAvailableToUserInRelationToAccount: jest.fn(),
            getKeywordsByNamesWithLanguageAndLocation: jest.fn(),
            getKeywordsBySearchEngineThatMissedUpdates: jest.fn(),
            getKeywordsForSearchEngineForAScheduledUpdate: jest.fn(),
            getKeywordById: jest.fn(),
            getKeywordWithLastPositionByKeywordId: jest.fn(),
            getKeywordsByIdsAndRelations: jest.fn(),
            getNumberOfAvailableKeywordsToUpdate: jest.fn(),
            getKeywordsForManualUpdate: jest.fn(),
            getKeywordsWithKeywordPositions: jest.fn(),
            getKeywordsByIdsAndProjectId: jest.fn(),
            getNumberOfProjectsKeywordsToUpdate: jest.fn(),
            getNumberOfProjectsKeywords: jest.fn(),
          },
        },
        {
          provide: KeywordsPositionsService,
          useValue: {
            deleteKeywordPositionsByKeywordIds: jest.fn(),
          },
        },
        {
          provide: CompetitorsService,
          useValue: {
            deleteKeywordPositionsByKeywordIds: jest.fn(),
            getPositionHistory: jest.fn(),
            getProjectPerformanceByCompetitorIds: jest.fn(),
          },
        },
        {
          provide: KeywordRankingsResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: SearchResultsResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: GetKeywordResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: SearchResultRepository,
          useValue: {
            getLastSearchResultByKeywordId: jest.fn(),
          },
        },
        {
          provide: NotesService,
          useValue: { getNotesProjectByDate: jest.fn() },
        },
        {
          provide: OverviewCacheTransformer,
          useValue: { cache: jest.fn() },
        },
        {
          provide: LatestProjectOverviewRepository,
          useValue: { getCurrentDatesOfLastProjectUpdate: jest.fn() },
        },
        {
          provide: ImprovedVsDeclinedCacheTransformer,
          useValue: { cache: jest.fn() },
        },
        {
          provide: KeywordTrendsCacheTransformer,
          useValue: { cache: jest.fn() },
        },
        {
          provide: ProjectPerformanceCacheTransformer,
          useValue: { cache: jest.fn() },
        },
        {
          provide: PositionHistoryCacheTransformer,
          useValue: { cache: jest.fn() },
        },
        {
          provide: AccountLimitsService,
          useValue: {
            getAllLimitsOfCurrentAccount: jest.fn(),
            limitKeywordUpdatesToADailyLimit: jest.fn(),
            takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults: jest.fn(),
            limitLiveModeKeywordUpdatesToADailyLimit: jest.fn(),
            takeIntoAccountQuotaOfLiveModeUpdatesPerDay: jest.fn(),
          },
        },
        {
          provide: ProjectRepository,
          useValue: {
            getKeywordsGroupedByProject: jest.fn(),
            getUserAvailableProjectsInRelationToAccount: jest.fn(),
            getProjectByIdWithSearchEngine: jest.fn(),
          },
        },
      ],
    }).compile();
    keywordsService = module.get<KeywordsService>(KeywordsService);
    keywordRepository = module.get<KeywordRepository>(KeywordRepository);
    eventBus = module.get<EventBus>(EventBus);
    accountLimitsService = module.get(AccountLimitsService);
    getKeywordResponseFactory = module.get(GetKeywordResponseFactory);
    searchResultRepository = module.get(SearchResultRepository);
    searchResultsResponseFactory = module.get(SearchResultsResponseFactory);
    updateKeywordPositionQueue = module.get<Queue>(
      getQueueToken(Queues.UpdateKeywordPosition),
    );
    projectsQueue = module.get<Queue>(getQueueToken(Queues.Projects));
    projectRepository = module.get<ProjectRepository>(ProjectRepository);
    competitorsService = module.get(CompetitorsService);
    keywordsPositionsService = module.get(KeywordsPositionsService);
    projectPerformanceCacheTransformer = module.get(
      ProjectPerformanceCacheTransformer,
    );
    notesService = module.get(NotesService);
    keywordRankingsResponseFactory = module.get(KeywordRankingsResponseFactory);
    positionHistoryCacheTransformer = module.get(
      PositionHistoryCacheTransformer,
    );
    keywordTrendsCacheTransformer = module.get(KeywordTrendsCacheTransformer);
    improvedVsDeclinedCacheTransformer = module.get(
      ImprovedVsDeclinedCacheTransformer,
    );
    overviewCacheTransformer = module.get(OverviewCacheTransformer);
    latestProjectOverviewRepository = module.get(
      LatestProjectOverviewRepository,
    );
  });
  //
  it('should be defined', () => {
    expect(keywordsService).toBeDefined();
  });
  //
  describe('checkIfKeywordsAreRelatedToUserAccount', () => {
    const accountId = accountEntityMock.id;
    const userId = userEntityMock.id;

    it('should not throw an error if all keywords are related to the account', async () => {
      const keywordIds = [keywordTest1Mock.id, keywordTest2Mock.id];
      const mockKeywords = [keywordTest1Mock, keywordTest2Mock];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsAvailableToUserInRelationToAccount',
        )
        .mockResolvedValue(mockKeywords);

      await expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount(
          accountId,
          keywordIds,
          userId,
        ),
      ).resolves.not.toThrow();

      expect(
        keywordRepository.getKeywordsAvailableToUserInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, keywordIds, userId);
    });

    it('should throw ForbiddenException if some keywords are not related to the account', async () => {
      const keywordIds = [keywordTest1Mock.id, keywordTest2Mock.id];
      const mockKeywords = [keywordTest1Mock]; // Only one keyword is related

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsAvailableToUserInRelationToAccount',
        )
        .mockResolvedValue(mockKeywords as any);

      await expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount(
          accountId,
          keywordIds,
          userId,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(
        keywordRepository.getKeywordsAvailableToUserInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, keywordIds, userId);
    });

    it('should handle empty keywordIds gracefully', async () => {
      const keywordIds: number[] = [];
      const mockKeywords: any[] = [];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsAvailableToUserInRelationToAccount',
        )
        .mockResolvedValue(mockKeywords);

      await expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount(
          accountId,
          keywordIds,
          userId,
        ),
      ).resolves.not.toThrow();

      expect(
        keywordRepository.getKeywordsAvailableToUserInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, keywordIds, userId);
    });
  });
  //
  describe('saveResultsOfReadyTask', () => {
    it('should save keywords with updated data if task result matches keywords', async () => {
      const task = {
        data: {
          keywords: [keywordTest1Mock.name, keywordTest2Mock.name],
          language_name: 'en',
        },
        result: [
          {
            keyword: keywordTest1Mock.name,
            monthly_searches: [{ search_volume: 100 }],
            cpc: 1.5,
            competition_index: 0.8,
          },
          {
            keyword: keywordTest2Mock.name,
            monthly_searches: [{ search_volume: 50 }],
            cpc: 0.5,
            competition_index: 0.3,
          },
        ],
      };

      const mockKeywords = [
        { ...keywordTest1Mock, searchVolume: 0, cpc: 0, competitionIndex: 0 },
        { ...keywordTest2Mock, searchVolume: 0, cpc: 0, competitionIndex: 0 },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsByNamesWithLanguageAndLocation')
        .mockResolvedValue(mockKeywords);

      await keywordsService.saveResultsOfReadyTask(task as any);

      expect(
        keywordRepository.getKeywordsByNamesWithLanguageAndLocation,
      ).toHaveBeenCalledWith(task.data.keywords, task.data.language_name);
      expect(keywordRepository.save).toHaveBeenCalledWith([
        {
          ...keywordTest1Mock,
          searchVolume: 100,
          cpc: 1.5,
          competitionIndex: 0.8,
        },
        {
          ...keywordTest2Mock,
          searchVolume: 50,
          cpc: 0.5,
          competitionIndex: 0.3,
        },
      ]);
    });

    it('should set default values for keywords not found in the task result', async () => {
      const task = {
        data: {
          keywords: [keywordTest1Mock.name, keywordTest2Mock.name],
          language_name: 'en',
        },
        result: [
          {
            keyword: keywordTest1Mock.name,
            monthly_searches: [{ search_volume: 100 }],
            cpc: 1.5,
            competition_index: 0.8,
          },
        ],
      };

      const mockKeywords = [
        { ...keywordTest1Mock, searchVolume: 0, cpc: 0, competitionIndex: 0 },
        { ...keywordTest2Mock, searchVolume: 0, cpc: 0, competitionIndex: 0 },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsByNamesWithLanguageAndLocation')
        .mockResolvedValue(mockKeywords);

      await keywordsService.saveResultsOfReadyTask(task as any);

      expect(keywordRepository.save).toHaveBeenCalledWith([
        {
          ...keywordTest1Mock,
          searchVolume: 100,
          cpc: 1.5,
          competitionIndex: 0.8,
        },
        {
          ...keywordTest2Mock,
          searchVolume: 0,
          cpc: 0,
          competitionIndex: 0,
        },
      ]);
    });

    it('should handle empty keywords array gracefully', async () => {
      const task = {
        data: {
          keywords: [],
          language_name: 'en',
        },
        result: [],
      } as any;

      jest
        .spyOn(keywordRepository, 'getKeywordsByNamesWithLanguageAndLocation')
        .mockResolvedValue([]);

      await keywordsService.saveResultsOfReadyTask(task as any);

      expect(
        keywordRepository.getKeywordsByNamesWithLanguageAndLocation,
      ).toHaveBeenCalledWith(task.data.keywords, task.data.language_name);
      expect(keywordRepository.save).toHaveBeenCalledWith([]);
    });
  });
  //
  describe('updatingKeywordsThatMissedUpdatesForBaidu', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForBaidu();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Baidu);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBaiduEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updatingKeywordsThatMissedUpdatesForBaidu();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Baidu);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForBaidu();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);

      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBaiduEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updatingKeywordsThatMissedUpdatesForYahoo', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForYahoo();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Yahoo);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYahooEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updatingKeywordsThatMissedUpdatesForYahoo();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Yahoo);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForYahoo();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYahooEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updatingKeywordsThatMissedUpdatesForBing', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForBing();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Bing);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBingEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updatingKeywordsThatMissedUpdatesForBing();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Bing);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForBing();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBingEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updatingKeywordsThatMissedUpdatesForYoutube', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForYoutube();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.YouTube);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updatingKeywordsThatMissedUpdatesForYoutube();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.YouTube);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForYoutube();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updatingKeywordsThatMissedUpdatesForGoogleMaps', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForGoogleMaps();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMaps);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updatingKeywordsThatMissedUpdatesForGoogleMaps();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMaps);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForGoogleMaps();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updatingKeywordsThatMissedUpdatesForGoogleLocal', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForGoogleLocal();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMyBusiness);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updatingKeywordsThatMissedUpdatesForGoogleLocal();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMyBusiness);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updatingKeywordsThatMissedUpdatesForGoogleLocal();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updateKeywordsThatMissedUpdates', () => {
    it('should publish an event if there are keywords that missed updates', async () => {
      const mockKeywordIds = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updateKeywordsThatMissedUpdates();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Google);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords missed updates', async () => {
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordsThatMissedUpdates();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Google);
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should handle repository and event calls correctly', async () => {
      const mockKeywordIds = [{ id: keywordTest1Mock.id }];
      jest
        .spyOn(keywordRepository, 'getKeywordsBySearchEngineThatMissedUpdates')
        .mockResolvedValue(mockKeywordIds as any);

      await keywordsService.updateKeywordsThatMissedUpdates();

      expect(
        keywordRepository.getKeywordsBySearchEngineThatMissedUpdates,
      ).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledTimes(1);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueEvent({
          keywordIds: [keywordTest1Mock.id],
        }),
      );
    });
  });
  //
  describe('updateKeywordPositionsForPeriodsForBaidu', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriodsForBaidu();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Baidu);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBaiduEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBaiduEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForBaidu();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Baidu);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForBaidu();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Baidu);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateKeywordPositionsForPeriodsForYahoo', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriodsForYahoo();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Yahoo);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYahooEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYahooEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForYahoo();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Yahoo);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForYahoo();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Yahoo);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateKeywordPositionsForPeriodsForBing', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriodsForBing();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Bing);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBingEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForBingEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForBing();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Bing);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForBing();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Bing);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateKeywordPositionsForPeriodsForYoutube', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriodsForYoutube();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.YouTube);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2 * 5);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1 * 5);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForYoutubeEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForYoutube();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.YouTube);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForYoutube();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.YouTube);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateKeywordPositionsForPeriodsForGoogleMaps', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriodsForGoogleMaps();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMaps);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleMapsEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForGoogleMaps();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMaps);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForGoogleMaps();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMaps);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateKeywordPositionsForPeriodsForGoogleLocal', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriodsForGoogleLocal();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMyBusiness);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2 * 5);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1 * 5);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueForGoogleLocalEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForGoogleLocal();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMyBusiness);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriodsForGoogleLocal();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.GoogleMyBusiness);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateKeywordPositionsForPeriods', () => {
    it('should publish an event if keywords pass account limits', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
        { account_id: accountEntitySecondMock.id, id: keywordTest3Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValueOnce([
          { id: keywordTest1Mock.id },
          { id: keywordTest2Mock.id },
        ] as any)
        .mockResolvedValueOnce([{ id: keywordTest3Mock.id }] as any);

      await keywordsService.updateKeywordPositionsForPeriods();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Google);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, [
        { id: keywordTest3Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledTimes(2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntitySecondMock.id, 1);
      expect(eventBus.publish).toHaveBeenCalledTimes(2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new UpdateKeywordPositionsUsingStandardQueueEvent({
          keywordIds: [keywordTest3Mock.id],
        }),
      );
    });

    it('should not publish an event if no keywords are available for updates', async () => {
      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriods();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Google);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should not publish an event if account limits do not allow updates', async () => {
      const mockKeywordIds = [
        { account_id: accountEntityMock.id, id: keywordTest1Mock.id },
        { account_id: accountEntityMock.id, id: keywordTest2Mock.id },
      ];

      jest
        .spyOn(
          keywordRepository,
          'getKeywordsForSearchEngineForAScheduledUpdate',
        )
        .mockResolvedValue(mockKeywordIds as any);

      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([]);

      await keywordsService.updateKeywordPositionsForPeriods();

      expect(
        keywordRepository.getKeywordsForSearchEngineForAScheduledUpdate,
      ).toHaveBeenCalledWith(SearchEnginesEnum.Google);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledTimes(1);
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('getKeyword', () => {
    const payload = {
      accountId: accountEntityMock.id,
      keywordId: keywordTest1Mock.id,
      user: {
        id: userEntityMock.id,
        email: userEntityMock.email,
        accounts: [accountEntityMock],
      },
    };

    it('should return the keyword response if the keyword exists and is accessible', async () => {
      const mockKeyword = { ...keywordTest1Mock };
      const mockResponse = { id: keywordTest1Mock.id, data: 'response data' };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keywordRepository, 'getKeywordById')
        .mockResolvedValue(mockKeyword);
      jest
        .spyOn(getKeywordResponseFactory, 'createResponse')
        .mockReturnValue(mockResponse as any);

      const result = await keywordsService.getKeyword(payload as any);

      expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount,
      ).toHaveBeenCalledWith(
        payload.accountId,
        [payload.keywordId],
        payload.user.id,
      );
      expect(keywordRepository.getKeywordById).toHaveBeenCalledWith(
        payload.keywordId,
      );
      expect(getKeywordResponseFactory.createResponse).toHaveBeenCalledWith(
        mockKeyword,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw NotFoundException if the keyword is not found', async () => {
      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest.spyOn(keywordRepository, 'getKeywordById').mockResolvedValue(null);

      await expect(keywordsService.getKeyword(payload as any)).rejects.toThrow(
        NotFoundException,
      );

      expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount,
      ).toHaveBeenCalledWith(
        payload.accountId,
        [payload.keywordId],
        payload.user.id,
      );
      expect(keywordRepository.getKeywordById).toHaveBeenCalledWith(
        payload.keywordId,
      );
    });

    it('should check if the keyword is related to the user account', async () => {
      const mockKeyword = { ...keywordTest1Mock };
      const mockResponse = { id: keywordTest1Mock.id, data: 'response data' };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keywordRepository, 'getKeywordById')
        .mockResolvedValue(mockKeyword);
      jest
        .spyOn(getKeywordResponseFactory, 'createResponse')
        .mockReturnValue(mockResponse as any);

      await keywordsService.getKeyword(payload as any);

      expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount,
      ).toHaveBeenCalledWith(
        payload.accountId,
        [payload.keywordId],
        payload.user.id,
      );
    });
  });
  //
  describe('searchResults', () => {
    const payload = {
      accountId: accountEntityMock.id,
      keywordId: keywordTest1Mock.id,
      userId: userEntityMock.id,
    };

    const options = {
      limit: 10,
      page: 1,
    };

    it('should return search results with pagination if data exists', async () => {
      const mockKeyword = {
        id: keywordTest1Mock.id,
        keywordPositionsForDay: [{ ...keywordTest1Mock, position: 1 }],
      };
      const mockResult = {
        result: [
          { id: 1, keyword: keywordTest1Mock },
          { id: 2, keyword: keywordTest1Mock },
        ],
      };
      const mockPaginatedData = {
        items: [
          {
            keywordPosition: false,
            // @ts-ignore
            position: undefined,
            // @ts-ignore
            url: undefined,
          },
          {
            keywordPosition: false,
            position: undefined,
            url: undefined,
          },
        ],
        meta: {
          itemCount: 2,
          totalItems: 2,
          itemsPerPage: 10,
          currentPage: 1,
          totalPages: 1,
        },
      };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keywordRepository, 'getKeywordWithLastPositionByKeywordId')
        .mockResolvedValue(mockKeyword as any);
      jest
        .spyOn(searchResultRepository, 'getLastSearchResultByKeywordId')
        .mockResolvedValue(mockResult as any);
      const paginate = jest.fn().mockReturnValue(mockPaginatedData);

      jest
        .spyOn(searchResultsResponseFactory, 'createResponse')
        .mockReturnValue(mockPaginatedData as any);

      const result = await keywordsService.searchResults(payload, options);

      expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount,
      ).toHaveBeenCalledWith(
        payload.accountId,
        [payload.keywordId],
        payload.userId,
      );
      expect(
        keywordRepository.getKeywordWithLastPositionByKeywordId,
      ).toHaveBeenCalledWith(payload.keywordId);
      expect(
        searchResultRepository.getLastSearchResultByKeywordId,
      ).toHaveBeenCalledWith(payload.keywordId);
      expect(searchResultsResponseFactory.createResponse).toHaveBeenCalledWith(
        mockPaginatedData.items,
        mockPaginatedData.meta,
      );
      expect(result).toEqual(mockPaginatedData);
    });

    it('should throw NotFoundException if the keyword is not found', async () => {
      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keywordRepository, 'getKeywordWithLastPositionByKeywordId')
        .mockResolvedValue(null);

      await expect(
        keywordsService.searchResults(payload, options),
      ).rejects.toThrow(NotFoundException);

      expect(
        keywordsService.checkIfKeywordsAreRelatedToUserAccount,
      ).toHaveBeenCalledWith(
        payload.accountId,
        [payload.keywordId],
        payload.userId,
      );
      expect(
        keywordRepository.getKeywordWithLastPositionByKeywordId,
      ).toHaveBeenCalledWith(payload.keywordId);
    });

    it('should return empty meta and items if no search result exists', async () => {
      const mockKeyword = {
        id: 'keyword1',
        keywordPositionsForDay: [],
      } as any;
      const mockMeta = {
        itemCount: 0,
        totalItems: 0,
        itemsPerPage: 10,
        totalPage: 0,
        currentPage: 1,
      };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keywordRepository, 'getKeywordWithLastPositionByKeywordId')
        .mockResolvedValue(mockKeyword);
      jest
        .spyOn(searchResultRepository, 'getLastSearchResultByKeywordId')
        .mockResolvedValue(null);
      jest
        .spyOn(searchResultsResponseFactory, 'createResponse')
        .mockReturnValue({
          items: [],
          meta: mockMeta,
        } as any);

      const result = await keywordsService.searchResults(payload, options);

      expect(searchResultsResponseFactory.createResponse).toHaveBeenCalledWith(
        [],
        mockMeta,
      );
      expect(result).toEqual({ items: [], meta: mockMeta });
    });

    it('should use default pagination if options are not provided', async () => {
      const mockKeyword = {
        id: keywordTest1Mock.id,
        keywordPositionsForDay: [{ position: 1 }],
      };
      const mockResult = {
        result: [
          // @ts-ignore
          { keywordPosition: false, position: undefined, url: undefined },
        ],
      };
      const mockMeta = {
        itemCount: 1,
        totalItems: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);
      jest
        .spyOn(keywordRepository, 'getKeywordWithLastPositionByKeywordId')
        .mockResolvedValue(mockKeyword as any);
      jest
        .spyOn(searchResultRepository, 'getLastSearchResultByKeywordId')
        .mockResolvedValue(mockResult as any);
      const paginate = jest.fn().mockReturnValue({
        items: mockResult.result,
        meta: mockMeta,
      });
      jest
        .spyOn(searchResultsResponseFactory, 'createResponse')
        .mockReturnValue({
          items: mockResult.result,
          meta: mockMeta,
        } as any);

      const result = await keywordsService.searchResults(payload, {});

      expect(searchResultsResponseFactory.createResponse).toHaveBeenCalledWith(
        mockResult.result,
        mockMeta,
      );
      expect(result).toEqual({ items: mockResult.result, meta: mockMeta });
    });
  });
  //
  describe('updatePositionsForBaidu', () => {
    it('should return immediately if no keywords are provided', async () => {
      await keywordsService.updatePositionsForBaidu([]);

      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();
    });

    it('should add keywords to the queue when keywords are provided', async () => {
      const mockKeywords = [keywordTest1Mock, keywordTest2Mock];

      await keywordsService.updatePositionsForBaidu(mockKeywords);

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledTimes(1);
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForBaidu,
        {
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
          isManual: true,
        },
      );
    });

    it('should correctly process mixed cases (empty and non-empty arrays)', async () => {
      const mockKeywords = [{ ...keywordTest3Mock }] as any;

      await keywordsService.updatePositionsForBaidu([] as any);

      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();

      await keywordsService.updatePositionsForBaidu(mockKeywords);

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledTimes(1);
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForBaidu,
        {
          keywordIds: [keywordTest3Mock.id],
          isManual: true,
        },
      );
    });
  });
  //
  describe('updatePositionsForYoutube', () => {
    it('should return early if updatedKeywords is empty', async () => {
      await keywordsService.updatePositionsForYoutube([], accountEntityMock.id);
      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
    });

    it('should process keywords and update positions', async () => {
      const updatedKeywords = [
        { id: keywordTest1Mock.id },
        { id: keywordTest2Mock.id },
      ] as any;
      const accountId = accountEntityMock.id;
      const keywords = [{ ...keywordTest1Mock }, { ...keywordTest2Mock }];

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(keywords as any);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          { account: { ...accountEntityMock }, keywords },
        ] as any);

      await keywordsService.updatePositionsForYoutube(
        updatedKeywords,
        accountId,
      );

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountId, updatedKeywords);
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForYoutube,
        { keywordId: keywordTest1Mock.id, isManual: true },
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForYoutube,
        { keywordId: keywordTest2Mock.id, isManual: true },
      );
      expect(eventBus.publish).toHaveBeenCalled();
    });

    it('should split keywords between live-mode and manual queues if over limit', async () => {
      const mockKeywords = Array.from({ length: 105 }, (_, i) => ({
        ...keywordTest1Mock,
        id: i + 1,
        name: `keyword${i + 1}`,
      })) as any;
      const limitedKeywords = mockKeywords.slice(0, 100);
      const manualKeywords = mockKeywords.slice(100);

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: limitedKeywords,
          },
        ] as any);

      await keywordsService.updatePositionsForYoutube(
        mockKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledTimes(101); // 100 live-mode + 1 manual
      // @ts-ignore
      limitedKeywords.forEach((keyword) => {
        expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
          QueueEventEnum.ManualKeywordUpdatesInLiveModeForYoutube,
          { keywordId: keyword.id, isManual: true },
        );
      });

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForYoutube,
        {
          // @ts-ignore
          keywordIds: manualKeywords.map((kw) => kw.id),
          isManual: true,
        },
      );

      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 100 * 5);

      expect(eventBus.publish).toHaveBeenCalledWith(
        new StartOfKeywordUpdateEvent({
          // @ts-ignore
          keywordIds: limitedKeywords.map((kw) => kw.id),
        }),
      );
    });
  });
  //
  describe('updatePositionsForYahoo', () => {
    it('should return immediately if updatedKeywords is empty', async () => {
      await expect(
        keywordsService.updatePositionsForYahoo([], accountEntityMock.id),
      ).resolves.not.toThrow();

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should limit keywords and calculate manualKeywordIds', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
        { ...keywordTest3Mock },
      ];
      const limitedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const keywordsForPriorityQueue = [keywordTest3Mock.id];

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(keywordsService, 'findIdsNotInSecondArray')
        .mockResolvedValue(keywordsForPriorityQueue);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          { ...projectOneEntityMock, keywords: [], account: accountEntityMock },
        ]);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults',
        )
        .mockResolvedValue(void 0);

      await keywordsService.updatePositionsForYahoo(
        updatedKeywords,
        accountEntityMock.id,
      );

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, updatedKeywords);
      expect(keywordsService.findIdsNotInSecondArray).toHaveBeenCalledWith(
        updatedKeywords.map((item) => item.id),
        limitedKeywords,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForYahoo,
        {
          keywordIds: keywordsForPriorityQueue,
          isManual: true,
        },
      );
    });

    it('should add keywords to live mode queue and handle quota updates if within daily limit', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const limitedKeywords = updatedKeywords;

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForYahoo(
        updatedKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForYahoo,
        expect.objectContaining({
          keywordId: keywordTest1Mock.id,
          isManual: true,
        }),
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForYahoo,
        expect.objectContaining({
          keywordId: keywordTest2Mock.id,
          isManual: true,
        }),
      );

      expect(
        projectRepository.getKeywordsGroupedByProject,
      ).toHaveBeenCalledWith([keywordTest1Mock.id, keywordTest2Mock.id]);

      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);

      expect(eventBus.publish).toHaveBeenCalledWith(
        new StartOfKeywordUpdateEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should add extra keywords to manual queue if exceeding daily limit', async () => {
      const largeKeywords = Array.from({ length: 150 }, (_, i) => ({
        ...keywordTest1Mock,
        id: i + 1,
        name: `keyword${i}`,
      }));
      const limitedLargeKeywords = largeKeywords.slice(0, 100);

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedLargeKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForYahoo(
        largeKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForYahoo,
        expect.objectContaining({
          keywordIds: largeKeywords.slice(100).map((k) => k.id),
          isManual: true,
        }),
      );
    });
  });
  //
  describe('updatePositionsForBing', () => {
    it('should return immediately if updatedKeywords is empty', async () => {
      await expect(
        keywordsService.updatePositionsForBing([], accountEntityMock.id),
      ).resolves.not.toThrow();

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should limit keywords and calculate manualKeywordIds', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
        { ...keywordTest3Mock },
      ];
      const limitedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const keywordsForPriorityQueue = [keywordTest3Mock.id];

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(keywordsService, 'findIdsNotInSecondArray')
        .mockResolvedValue(keywordsForPriorityQueue);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          { ...projectOneEntityMock, keywords: [], account: accountEntityMock },
        ]);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults',
        )
        .mockResolvedValue(void 0);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfLiveModeUpdatesPerDay',
        )
        .mockResolvedValue(void 0);

      await keywordsService.updatePositionsForBing(
        updatedKeywords,
        accountEntityMock.id,
      );
      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, updatedKeywords);
      expect(keywordsService.findIdsNotInSecondArray).toHaveBeenCalledWith(
        updatedKeywords.map((item) => item.id),
        limitedKeywords,
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForBing,
        {
          keywordIds: keywordsForPriorityQueue,
          isManual: true,
        },
      );
    });

    it('should add keywords to live mode queue and handle quota updates if within daily limit', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const limitedKeywords = updatedKeywords;

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForBing(
        updatedKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForBing,
        expect.objectContaining({
          keywordId: keywordTest1Mock.id,
          isManual: true,
        }),
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForBing,
        expect.objectContaining({
          keywordId: keywordTest2Mock.id,
          isManual: true,
        }),
      );
      expect(
        projectRepository.getKeywordsGroupedByProject,
      ).toHaveBeenCalledWith([keywordTest1Mock.id, keywordTest2Mock.id]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new StartOfKeywordUpdateEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should add extra keywords to manual queue if exceeding daily limit', async () => {
      const largeKeywords = Array.from({ length: 150 }, (_, i) => ({
        ...keywordTest1Mock,
        id: i + 1,
        name: `keyword${i}`,
      }));
      const limitedLargeKeywords = largeKeywords.slice(0, 100);

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedLargeKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForBing(
        largeKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForBing,
        expect.objectContaining({
          keywordIds: largeKeywords.slice(100).map((k) => k.id),
          isManual: true,
        }),
      );
    });
  });
  //
  describe('updatePositionsForGoogleMaps', () => {
    it('should return immediately if updatedKeywords is empty', async () => {
      await expect(
        keywordsService.updatePositionsForGoogleMaps([], accountEntityMock.id),
      ).resolves.not.toThrow();

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should limit keywords and calculate manualKeywordIds', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
        { ...keywordTest3Mock },
      ];
      const limitedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const keywordsForPriorityQueue = [keywordTest3Mock.id];

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(keywordsService, 'findIdsNotInSecondArray')
        .mockResolvedValue(keywordsForPriorityQueue);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          { ...projectOneEntityMock, keywords: [], account: accountEntityMock },
        ]);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults',
        )
        .mockResolvedValue(void 0);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfLiveModeUpdatesPerDay',
        )
        .mockResolvedValue(void 0);

      await keywordsService.updatePositionsForGoogleMaps(
        updatedKeywords,
        accountEntityMock.id,
      );
      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, updatedKeywords);
      expect(keywordsService.findIdsNotInSecondArray).toHaveBeenCalledWith(
        updatedKeywords.map((item) => item.id),
        limitedKeywords,
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForGoogleMaps,
        {
          keywordIds: keywordsForPriorityQueue,
          isManual: true,
        },
      );
    });

    it('should add keywords to live mode queue and handle quota updates if within daily limit', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const limitedKeywords = updatedKeywords;

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForGoogleMaps(
        updatedKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleMaps,
        expect.objectContaining({
          keywordId: keywordTest1Mock.id,
          isManual: true,
        }),
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleMaps,
        expect.objectContaining({
          keywordId: keywordTest2Mock.id,
          isManual: true,
        }),
      );
      expect(
        projectRepository.getKeywordsGroupedByProject,
      ).toHaveBeenCalledWith([keywordTest1Mock.id, keywordTest2Mock.id]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new StartOfKeywordUpdateEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should add extra keywords to manual queue if exceeding daily limit', async () => {
      const largeKeywords = Array.from({ length: 150 }, (_, i) => ({
        ...keywordTest1Mock,
        id: i + 1,
        name: `keyword${i}`,
      }));
      const limitedLargeKeywords = largeKeywords.slice(0, 100);

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedLargeKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForGoogleMaps(
        largeKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForGoogleMaps,
        expect.objectContaining({
          keywordIds: largeKeywords.slice(100).map((k) => k.id),
          isManual: true,
        }),
      );
    });
  });
  //
  describe('updatePositionsForGoogleLocal', () => {
    it('should return immediately if updatedKeywords is empty', async () => {
      await expect(
        keywordsService.updatePositionsForGoogleLocal([], accountEntityMock.id),
      ).resolves.not.toThrow();

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should limit keywords and calculate manualKeywordIds', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
        { ...keywordTest3Mock },
      ];
      const limitedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const keywordsForPriorityQueue = [keywordTest3Mock.id];

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(keywordsService, 'findIdsNotInSecondArray')
        .mockResolvedValue(keywordsForPriorityQueue);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          { ...projectOneEntityMock, keywords: [], account: accountEntityMock },
        ]);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults',
        )
        .mockResolvedValue(void 0);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfLiveModeUpdatesPerDay',
        )
        .mockResolvedValue(void 0);

      await keywordsService.updatePositionsForGoogleLocal(
        updatedKeywords,
        accountEntityMock.id,
      );
      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, updatedKeywords);
      expect(keywordsService.findIdsNotInSecondArray).toHaveBeenCalledWith(
        updatedKeywords.map((item) => item.id),
        limitedKeywords,
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForGoogleLocal,
        {
          keywordIds: keywordsForPriorityQueue,
          isManual: true,
        },
      );
    });

    it('should add keywords to live mode queue and handle quota updates if within daily limit', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const limitedKeywords = updatedKeywords;

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForGoogleLocal(
        updatedKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleLocal,
        expect.objectContaining({
          keywordId: keywordTest1Mock.id,
          isManual: true,
        }),
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleLocal,
        expect.objectContaining({
          keywordId: keywordTest2Mock.id,
          isManual: true,
        }),
      );
      expect(
        projectRepository.getKeywordsGroupedByProject,
      ).toHaveBeenCalledWith([keywordTest1Mock.id, keywordTest2Mock.id]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2 * 5);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new StartOfKeywordUpdateEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should add extra keywords to manual queue if exceeding daily limit', async () => {
      const largeKeywords = Array.from({ length: 150 }, (_, i) => ({
        ...keywordTest1Mock,
        id: i + 1,
        name: `keyword${i}`,
      }));
      const limitedLargeKeywords = largeKeywords.slice(0, 100);

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedLargeKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositionsForGoogleLocal(
        largeKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesForGoogleLocal,
        expect.objectContaining({
          keywordIds: largeKeywords.slice(100).map((k) => k.id),
          isManual: true,
        }),
      );
    });
  });
  //
  describe('updatePositions', () => {
    it('should return immediately if updatedKeywords is empty', async () => {
      await expect(
        keywordsService.updatePositions([], accountEntityMock.id),
      ).resolves.not.toThrow();

      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
      expect(updateKeywordPositionQueue.add).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should limit keywords and calculate manualKeywordIds', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
        { ...keywordTest3Mock },
      ];
      const limitedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const keywordsForPriorityQueue = [keywordTest3Mock.id];

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(keywordsService, 'findIdsNotInSecondArray')
        .mockResolvedValue(keywordsForPriorityQueue);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          { ...projectOneEntityMock, keywords: [], account: accountEntityMock },
        ]);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults',
        )
        .mockResolvedValue(void 0);
      jest
        .spyOn(
          accountLimitsService,
          'takeIntoAccountQuotaOfLiveModeUpdatesPerDay',
        )
        .mockResolvedValue(void 0);

      await keywordsService.updatePositions(
        updatedKeywords,
        accountEntityMock.id,
      );
      expect(
        accountLimitsService.limitLiveModeKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(accountEntityMock.id, updatedKeywords);
      expect(keywordsService.findIdsNotInSecondArray).toHaveBeenCalledWith(
        updatedKeywords.map((item) => item.id),
        limitedKeywords,
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdates,
        {
          keywordIds: keywordsForPriorityQueue,
          isManual: true,
        },
      );
    });

    it('should add keywords to live mode queue and handle quota updates if within daily limit', async () => {
      const updatedKeywords = [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ];
      const limitedKeywords = updatedKeywords;

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositions(
        updatedKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveMode,
        expect.objectContaining({
          keywordId: keywordTest1Mock.id,
          isManual: true,
        }),
      );
      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdatesInLiveMode,
        expect.objectContaining({
          keywordId: keywordTest2Mock.id,
          isManual: true,
        }),
      );
      expect(
        projectRepository.getKeywordsGroupedByProject,
      ).toHaveBeenCalledWith([keywordTest1Mock.id, keywordTest2Mock.id]);
      expect(
        accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults,
      ).toHaveBeenCalledWith(accountEntityMock.id, 2);
      expect(eventBus.publish).toHaveBeenCalledWith(
        new StartOfKeywordUpdateEvent({
          keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        }),
      );
    });

    it('should add extra keywords to manual queue if exceeding daily limit', async () => {
      const largeKeywords = Array.from({ length: 150 }, (_, i) => ({
        ...keywordTest1Mock,
        id: i + 1,
        name: `keyword${i}`,
      }));
      const limitedLargeKeywords = largeKeywords.slice(0, 100);

      jest
        .spyOn(accountLimitsService, 'limitLiveModeKeywordUpdatesToADailyLimit')
        .mockResolvedValue(limitedLargeKeywords);
      jest
        .spyOn(projectRepository, 'getKeywordsGroupedByProject')
        .mockResolvedValue([
          {
            account: { ...accountEntityMock },
            keywords: [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
          },
        ] as any);

      await keywordsService.updatePositions(
        largeKeywords,
        accountEntityMock.id,
      );

      expect(updateKeywordPositionQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.ManualKeywordUpdates,
        expect.objectContaining({
          keywordIds: largeKeywords.slice(100).map((k) => k.id),
          isManual: true,
        }),
      );
    });
  });
  //
  describe('findIdsNotInSecondArray', () => {
    it('should return all ids if the second array is empty', async () => {
      const ids = [
        keywordTest1Mock.id,
        keywordTest2Mock.id,
        keywordTest3Mock.id,
      ];
      const objects = [] as any;

      const result = await keywordsService.findIdsNotInSecondArray(
        ids,
        objects,
      );

      expect(result).toEqual(ids);
    });

    it('should return only ids not present in the second array', async () => {
      const ids = [
        keywordTest1Mock.id,
        keywordTest2Mock.id,
        keywordTest3Mock.id,
      ];
      const objects = [keywordTest2Mock, keywordTest3Mock];
      const result = await keywordsService.findIdsNotInSecondArray(
        ids,
        objects,
      );

      expect(result).toEqual([keywordTest1Mock.id]);
    });

    it('should return an empty array if all ids are in the second array', async () => {
      const ids = [
        keywordTest1Mock.id,
        keywordTest2Mock.id,
        keywordTest3Mock.id,
      ];
      const objects = [keywordTest1Mock, keywordTest2Mock, keywordTest3Mock];

      const result = await keywordsService.findIdsNotInSecondArray(
        ids,
        objects,
      );

      expect(result).toEqual([]);
    });

    it('should handle cases where ids array is empty', async () => {
      const ids: number[] = [];
      const objects = [keywordTest1Mock];

      const result = await keywordsService.findIdsNotInSecondArray(
        ids,
        objects,
      );

      expect(result).toEqual([]);
    });
  });
  //
  describe('deleteProjectKeywords', () => {
    it('should throw BadRequestException if keywords are not found', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      } as any;

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getKeywordsByIdsAndRelations')
        .mockResolvedValue([{ ...keywordTest1Mock }]);

      await expect(
        keywordsService.deleteProjectKeywords(payload),
      ).rejects.toThrow(BadRequestException);

      expect(
        keywordRepository.getKeywordsByIdsAndRelations,
      ).toHaveBeenCalledWith(
        payload.keywordIds,
        payload.accountId,
        payload.projectId,
      );
      expect(
        competitorsService.deleteKeywordPositionsByKeywordIds,
      ).not.toHaveBeenCalled();
      expect(
        keywordsPositionsService.deleteKeywordPositionsByKeywordIds,
      ).not.toHaveBeenCalled();
      expect(keywordRepository.remove).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });

    it('should delete keywords and publish event when all keywords are found', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      } as any;

      const foundKeywords = [{ ...keywordTest1Mock }, { ...keywordTest2Mock }];

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getKeywordsByIdsAndRelations')
        .mockResolvedValue(foundKeywords);

      await keywordsService.deleteProjectKeywords(payload);

      expect(
        keywordRepository.getKeywordsByIdsAndRelations,
      ).toHaveBeenCalledWith(
        payload.keywordIds,
        payload.accountId,
        payload.projectId,
      );
      expect(
        competitorsService.deleteKeywordPositionsByKeywordIds,
      ).toHaveBeenCalledWith(payload.keywordIds);
      expect(
        keywordsPositionsService.deleteKeywordPositionsByKeywordIds,
      ).toHaveBeenCalledWith(payload.keywordIds);
      expect(keywordRepository.remove).toHaveBeenCalledWith(foundKeywords);

      expect(eventBus.publish).toHaveBeenCalledWith(
        new RemoteProjectsEvent({
          accountId: payload.accountId,
          projectIds: [payload.projectId],
        }),
      );
    });

    it('should call checkAttitudeOfAccount before proceeding', async () => {
      const checkAttitudeSpy = jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(undefined);

      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      } as any;

      jest
        .spyOn(keywordRepository, 'getKeywordsByIdsAndRelations')
        .mockResolvedValue([{ ...keywordTest1Mock }, { ...keywordTest2Mock }]);

      await keywordsService.deleteProjectKeywords(payload);

      expect(checkAttitudeSpy).toHaveBeenCalledWith(
        payload.accountId,
        [payload.projectId],
        payload.user.id,
      );
    });
  });
  //
  describe('getNumberOfAvailableKeywordsToUpdate', () => {
    it('should return the correct number of unavailable keywords to update', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordIds: [
          keywordTest1Mock.id,
          keywordTest2Mock.id,
          keywordTest3Mock.id,
        ],
        userId: userEntityMock.id,
      };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getNumberOfAvailableKeywordsToUpdate')
        .mockResolvedValue(2);

      const result = await keywordsService.getNumberOfAvailableKeywordsToUpdate(
        payload,
      );

      expect(
        keywordRepository.getNumberOfAvailableKeywordsToUpdate,
      ).toHaveBeenCalledWith(payload.keywordIds);
      expect(result).toEqual(
        new GetNumberOfAvailableKeywordsToUpdateResponse({
          keywordCount: 1,
        }),
      );
    });

    it('should call checkIfKeywordsAreRelatedToUserAccount before fetching keyword count', async () => {
      const checkKeywordsSpy = jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(undefined);

      const payload = {
        accountId: accountEntityMock.id,
        keywordIds: [
          keywordTest1Mock.id,
          keywordTest2Mock.id,
          keywordTest3Mock.id,
        ],
        userId: userEntityMock.id,
      };

      jest
        .spyOn(keywordRepository, 'getNumberOfAvailableKeywordsToUpdate')
        .mockResolvedValue(0);

      await keywordsService.getNumberOfAvailableKeywordsToUpdate(payload);

      expect(checkKeywordsSpy).toHaveBeenCalledWith(
        payload.accountId,
        payload.keywordIds,
        payload.userId,
      );
    });

    it('should handle case when all keywords are available to update', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordIds: [
          keywordTest1Mock.id,
          keywordTest2Mock.id,
          keywordTest3Mock.id,
        ],
        userId: userEntityMock.id,
      };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getNumberOfAvailableKeywordsToUpdate')
        .mockResolvedValue(3);

      const result = await keywordsService.getNumberOfAvailableKeywordsToUpdate(
        payload,
      );

      expect(result).toEqual(
        new GetNumberOfAvailableKeywordsToUpdateResponse({
          keywordCount: 0,
        }),
      );
    });

    it('should handle case when none of the keywords are available to update', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordIds: [
          keywordTest1Mock.id,
          keywordTest2Mock.id,
          keywordTest3Mock.id,
        ],
        userId: userEntityMock.id,
      };

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getNumberOfAvailableKeywordsToUpdate')
        .mockResolvedValue(0);

      const result = await keywordsService.getNumberOfAvailableKeywordsToUpdate(
        payload,
      );

      expect(result).toEqual(
        new GetNumberOfAvailableKeywordsToUpdateResponse({
          keywordCount: 3,
        }),
      );
    });
  });
  //
  describe('updateKeywordPositions', () => {
    it('should handle Google search engine correctly', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id, keywordTest2Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      };

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectRepository, 'getProjectByIdWithSearchEngine')
        .mockResolvedValue({
          id: projectOneEntityMock.id,
          searchEngine: { name: SearchEnginesEnum.Google },
        } as any);
      jest
        .spyOn(keywordRepository, 'getKeywordsForManualUpdate')
        .mockResolvedValue([{ ...keywordTest1Mock }, { ...keywordTest2Mock }]);
      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([{ ...keywordTest1Mock }, { ...keywordTest2Mock }]);

      const updatePositionsSpy = jest
        .spyOn(keywordsService, 'updatePositions')
        .mockResolvedValue(undefined);

      await keywordsService.updateKeywordPositions(payload as any);

      expect(
        projectRepository.getProjectByIdWithSearchEngine,
      ).toHaveBeenCalledWith(payload.projectId);
      expect(keywordRepository.getKeywordsForManualUpdate).toHaveBeenCalledWith(
        payload.keywordIds,
      );
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(payload.accountId, [
        { ...keywordTest1Mock },
        { ...keywordTest2Mock },
      ]);
      expect(updatePositionsSpy).toHaveBeenCalledWith(
        [{ ...keywordTest1Mock }, { ...keywordTest2Mock }],
        payload.accountId,
      );
      expect(projectsQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.UpdateProjectSchedules,
        { projectId: projectOneEntityMock.id },
        {
          jobId: `update-project-` + projectOneEntityMock.id,
          removeOnComplete: true,
          removeOnFail: true,
          delay: 6000,
        },
      );
    });

    it('should throw BadRequestException for an unsupported search engine', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      };

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectRepository, 'getProjectByIdWithSearchEngine')
        .mockResolvedValue({
          id: projectOneEntityMock.id,
          searchEngine: { name: 'UnsupportedEngine' },
        } as any);

      await expect(
        keywordsService.updateKeywordPositions(payload as any),
      ).rejects.toThrow(BadRequestException);
      expect(
        projectRepository.getProjectByIdWithSearchEngine,
      ).toHaveBeenCalledWith(payload.projectId);
      expect(keywordRepository.getKeywordsForManualUpdate).toHaveBeenCalledWith(
        payload.keywordIds,
      );
      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).not.toHaveBeenCalled();
    });

    it('should handle GoogleMyBusiness search engine with a limit of 5', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      };

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectRepository, 'getProjectByIdWithSearchEngine')
        .mockResolvedValue({
          id: projectOneEntityMock.id,
          searchEngine: { name: SearchEnginesEnum.GoogleMyBusiness },
        } as any);
      jest
        .spyOn(keywordRepository, 'getKeywordsForManualUpdate')
        .mockResolvedValue([keywordTest1Mock]);
      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([keywordTest1Mock]);

      const updatePositionsForGoogleLocalSpy = jest
        .spyOn(keywordsService, 'updatePositionsForGoogleLocal')
        .mockResolvedValue(undefined);

      await keywordsService.updateKeywordPositions(payload as any);

      expect(
        accountLimitsService.limitKeywordUpdatesToADailyLimit,
      ).toHaveBeenCalledWith(payload.accountId, [{ ...keywordTest1Mock }], 5);
      expect(updatePositionsForGoogleLocalSpy).toHaveBeenCalledWith(
        [{ ...keywordTest1Mock }],
        payload.accountId,
      );
    });

    it('should schedule a project update after processing', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        keywordIds: [keywordTest1Mock.id],
        user: {
          id: userEntityMock.id,
          email: userEntityMock.email,
          accounts: [accountEntityMock],
        },
      };

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectRepository, 'getProjectByIdWithSearchEngine')
        .mockResolvedValue({
          id: projectOneEntityMock.id,
          searchEngine: { name: SearchEnginesEnum.Google },
        } as any);
      jest
        .spyOn(keywordRepository, 'getKeywordsForManualUpdate')
        .mockResolvedValue([{ ...keywordTest1Mock }]);
      jest
        .spyOn(accountLimitsService, 'limitKeywordUpdatesToADailyLimit')
        .mockResolvedValue([{ ...keywordTest1Mock }]);
      jest
        .spyOn(keywordsService, 'updatePositions')
        .mockResolvedValue(undefined);

      await keywordsService.updateKeywordPositions(payload as any);

      expect(projectsQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.UpdateProjectSchedules,
        { projectId: projectOneEntityMock.id },
        expect.objectContaining({
          jobId: `update-project-` + projectOneEntityMock.id,
          delay: 6000,
        }),
      );
    });
  });
  //
  describe('getProjectPerformance', () => {
    let checkAttitudeOfAccountSpy: any;
    beforeEach(async () => {
      checkAttitudeOfAccountSpy = jest.spyOn(
        keywordsService,
        'checkAttitudeOfAccount',
      );
    });

    it('should fetch project performance and return a valid response', async () => {
      const payload = {
        accountId: 'account-id',
        projectId: 'project-id',
        period: 'last7Days',
        deviceType: 'desktop',
        userId: 'user-id',
        competitorIds: [],
      } as any;

      const mockProjectPerformance = [
        { date: '2024-11-01', position: 1.5 },
        { date: '2024-11-02', position: 2.0 },
      ];

      const mockNotes = [
        {
          id: 1,
          content: 'Test note',
          createdAt: '2024-11-01',
          author: { email: 'author@example.com' },
          project: { id: 'project-id' },
        },
      ];

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectPerformanceCacheTransformer, 'cache')
        .mockResolvedValue(mockProjectPerformance as any);
      jest
        .spyOn(notesService, 'getNotesProjectByDate')
        .mockResolvedValue(mockNotes as any);

      const result = await keywordsService.getProjectPerformance(payload);

      expect(checkAttitudeOfAccountSpy).toHaveBeenCalledWith(
        payload.accountId,
        [payload.projectId],
        payload.userId,
      );
      expect(projectPerformanceCacheTransformer.cache).toHaveBeenCalledWith({
        projectId: payload.projectId,
        fromDate: expect.any(String),
        toDate: expect.any(String),
        deviceType: payload.deviceType,
      });
      expect(notesService.getNotesProjectByDate).toHaveBeenCalledWith({
        projectId: payload.projectId,
        fromDate: expect.any(String),
        toDate: expect.any(String),
      });
      expect(result.dailyAveragePosition.items).toHaveLength(
        mockProjectPerformance.length,
      );
      expect(result.notes.items).toHaveLength(mockNotes.length);
      expect(result.dailyAveragePosition.items[0]).toEqual(
        expect.objectContaining({
          date: '2024-11-01',
          position: 1.5,
        }),
      );
      expect(result.notes.items[0]).toEqual(
        expect.objectContaining({
          content: 'Test note',
          date: '2024-11-01',
          author: 'author@example.com',
        }),
      );
    });

    it('should fetch competitors performance if competitorIds are provided', async () => {
      const payload = {
        accountId: 'account-id',
        projectId: 'project-id',
        period: 'last30Days',
        deviceType: 'mobile',
        userId: 'user-id',
        competitorIds: ['competitor-id-1', 'competitor-id-2'],
      };

      const mockCompetitorPerformance = [
        {
          competitorId: 'competitor-id-1',
          date: '2024-11-01',
          position: 3.2,
        },
      ];

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectPerformanceCacheTransformer, 'cache')
        .mockResolvedValue([]);
      jest.spyOn(notesService, 'getNotesProjectByDate').mockResolvedValue([]);
      jest
        .spyOn(competitorsService, 'getProjectPerformanceByCompetitorIds')
        .mockResolvedValue(
          new CompetitorsProjectPerformanceResponse({
            items: mockCompetitorPerformance,
          }),
        );

      const result = await keywordsService.getProjectPerformance(
        payload as any,
      );

      expect(
        competitorsService.getProjectPerformanceByCompetitorIds,
      ).toHaveBeenCalledWith(
        payload.projectId,
        payload.competitorIds,
        expect.any(String), // fromDate
        expect.any(String), // toDate
        payload.deviceType,
      );
      expect(result.competitorsProjectPerformance.items).toHaveLength(1);
      expect(result.competitorsProjectPerformance.items[0]).toEqual(
        expect.objectContaining({
          competitorId: 'competitor-id-1',
          date: '2024-11-01',
          position: 3.2,
        }),
      );
    });

    it('should return empty competitors performance if competitorIds are not provided', async () => {
      const payload = {
        accountId: 'account-id',
        projectId: 'project-id',
        period: 'last7Days',
        deviceType: 'mobile',
        userId: 'user-id',
        competitorIds: [],
      } as any;

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(projectPerformanceCacheTransformer, 'cache')
        .mockResolvedValue([]);
      jest.spyOn(notesService, 'getNotesProjectByDate').mockResolvedValue([]);

      const result = await keywordsService.getProjectPerformance(payload);

      expect(
        competitorsService.getProjectPerformanceByCompetitorIds,
      ).not.toHaveBeenCalled();
      expect(result.competitorsProjectPerformance.items).toHaveLength(0);
    });

    it('should throw an error if checkAttitudeOfAccount fails', async () => {
      const payload = {
        accountId: 'invalid-account-id',
        projectId: 'project-id',
        period: 'last7Days',
        deviceType: 'desktop',
        userId: 'user-id',
        competitorIds: [],
      } as any;

      checkAttitudeOfAccountSpy.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        keywordsService.getProjectPerformance(payload as any),
      ).rejects.toThrow('Unauthorized');

      expect(checkAttitudeOfAccountSpy).toHaveBeenCalledWith(
        payload.accountId,
        [payload.projectId],
        payload.userId,
      );
      expect(projectPerformanceCacheTransformer.cache).not.toHaveBeenCalled();
      expect(notesService.getNotesProjectByDate).not.toHaveBeenCalled();
    });
  });
  //
  describe('checkAttitudeOfAccount', () => {
    it('should pass if all projects are available for the user', async () => {
      const accountId = accountEntityMock.id;
      const projectIds = [projectOneEntityMock.id, projectTwoEntityMock.id];
      const userId = userEntityMock.id;

      jest
        .spyOn(projectRepository, 'getUserAvailableProjectsInRelationToAccount')
        .mockResolvedValue([projectOneEntityMock, projectTwoEntityMock]);

      await expect(
        keywordsService.checkAttitudeOfAccount(accountId, projectIds, userId),
      ).resolves.not.toThrow();

      expect(
        projectRepository.getUserAvailableProjectsInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, projectIds, userId);
    });

    it('should throw ForbiddenException if no projects are available for the user', async () => {
      const accountId = accountEntityMock.id;
      const projectIds = [projectOneEntityMock.id, projectTwoEntityMock.id];
      const userId = userEntityMock.id;

      jest
        .spyOn(projectRepository, 'getUserAvailableProjectsInRelationToAccount')
        .mockResolvedValue([]);

      await expect(
        keywordsService.checkAttitudeOfAccount(accountId, projectIds, userId),
      ).rejects.toThrow(ForbiddenException);

      expect(
        projectRepository.getUserAvailableProjectsInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, projectIds, userId);
    });

    it('should throw ForbiddenException if not all projects are available', async () => {
      const accountId = accountEntityMock.id;
      const projectIds = [projectOneEntityMock.id, projectTwoEntityMock.id];
      const userId = userEntityMock.id;

      jest
        .spyOn(projectRepository, 'getUserAvailableProjectsInRelationToAccount')
        .mockResolvedValue([]);

      await expect(
        keywordsService.checkAttitudeOfAccount(accountId, projectIds, userId),
      ).rejects.toThrow(ForbiddenException);
      expect(
        projectRepository.getUserAvailableProjectsInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, projectIds, userId);
    });

    it('should pass if userId is undefined and all projects are available', async () => {
      const accountId = accountEntityMock.id;
      const projectIds = [projectOneEntityMock.id, projectTwoEntityMock.id];

      jest
        .spyOn(projectRepository, 'getUserAvailableProjectsInRelationToAccount')
        .mockResolvedValue([projectOneEntityMock, projectTwoEntityMock]);

      await expect(
        keywordsService.checkAttitudeOfAccount(accountId, projectIds),
      ).resolves.not.toThrow();
      expect(
        projectRepository.getUserAvailableProjectsInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, projectIds, undefined);
    });

    it('should throw ForbiddenException if userId is undefined and no projects are available', async () => {
      const accountId = accountEntityMock.id;
      const projectIds = [projectOneEntityMock.id, projectTwoEntityMock.id];

      jest
        .spyOn(projectRepository, 'getUserAvailableProjectsInRelationToAccount')
        .mockResolvedValue([]);

      await expect(
        keywordsService.checkAttitudeOfAccount(accountId, projectIds),
      ).rejects.toThrow(ForbiddenException);

      expect(
        projectRepository.getUserAvailableProjectsInRelationToAccount,
      ).toHaveBeenCalledWith(accountId, projectIds, undefined);
    });
  });
  //
  describe('getKeywordRankings', () => {
    it('should return keyword rankings response', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        userId: userEntityMock.id,
      } as any;

      const options = {
        page: 1,
        limit: 10,
        search: 'test',
        sortBy: 'rank',
        sortOrder: 'asc',
        top3: true,
        top10: false,
        top30: false,
        top100: true,
        improved: false,
        declined: true,
        notRanked: false,
        noChange: true,
        lost: false,
        tagIds: ['tag1', 'tag2'],
        deviceType: 'desktop',
      } as any;

      const repositoryResult = {
        items: [{ id: keywordTest1Mock.id, rank: 1 }],
        meta: { total: 1, page: 1, limit: 10 },
      };

      const factoryResult = {
        data: [{ id: keywordTest1Mock.id, rank: 1 }],
        meta: { total: 1, page: 1, limit: 10 },
      };

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getKeywordsWithKeywordPositions')
        .mockResolvedValue(repositoryResult as any);
      jest
        .spyOn(keywordRankingsResponseFactory, 'createResponse')
        .mockReturnValue(factoryResult as any);

      const result = await keywordsService.getKeywordRankings(payload, options);

      expect(
        keywordRepository.getKeywordsWithKeywordPositions,
      ).toHaveBeenCalledWith(
        payload.projectId,
        {
          page: options.page,
          limit: options.limit,
          search: options.search,
          sortBy: options.sortBy,
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

      expect(
        keywordRankingsResponseFactory.createResponse,
      ).toHaveBeenCalledWith(repositoryResult.items, {
        meta: repositoryResult.meta,
      });

      expect(result).toEqual(factoryResult);
    });

    it('should throw ForbiddenException if user has no access to the project', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        userId: userEntityMock.id,
      } as any;

      const options = {
        page: 1,
        limit: 10,
      } as any;

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockRejectedValue(new ForbiddenException('Access denied.'));

      await expect(
        keywordsService.getKeywordRankings(payload, options),
      ).rejects.toThrow(ForbiddenException);
      expect(
        keywordRepository.getKeywordsWithKeywordPositions,
      ).not.toHaveBeenCalled();
    });

    it('should handle empty repository result', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        userId: userEntityMock.id,
      } as any;

      const options = {
        page: 1,
        limit: 10,
      } as any;

      const repositoryResult = {
        items: [],
        meta: { total: 0, page: 1, limit: 10 },
      } as any;

      const factoryResult = {
        data: [],
        meta: { total: 0, page: 1, limit: 10 },
      } as any;

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getKeywordsWithKeywordPositions')
        .mockResolvedValue(repositoryResult);
      jest
        .spyOn(keywordRankingsResponseFactory, 'createResponse')
        .mockReturnValue(factoryResult);

      const result = await keywordsService.getKeywordRankings(payload, options);

      expect(result).toEqual(factoryResult);
      expect(
        keywordRankingsResponseFactory.createResponse,
      ).toHaveBeenCalledWith(repositoryResult.items, {
        meta: repositoryResult.meta,
      });
    });

    it('should pass the correct sort and filter options to the repository', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        projectId: projectOneEntityMock.id,
        userId: userEntityMock.id,
      } as any;

      const options = {
        page: 2,
        limit: 15,
        search: 'example',
        sortBy: 'name',
        sortOrder: 'desc',
        top3: true,
        top10: true,
        noChange: false,
        lost: true,
      } as any;

      const repositoryResult = {
        items: [],
        meta: { total: 0, page: 2, limit: 15 },
      } as any;

      jest
        .spyOn(keywordsService, 'checkAttitudeOfAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(keywordRepository, 'getKeywordsWithKeywordPositions')
        .mockResolvedValue(repositoryResult);

      await keywordsService.getKeywordRankings(payload, options);

      expect(
        keywordRepository.getKeywordsWithKeywordPositions,
      ).toHaveBeenCalledWith(
        payload.projectId,
        {
          page: 2,
          limit: 15,
          search: 'example',
          sortBy: 'name',
          sortOrder: 'desc',
        },
        {
          top3: true,
          top10: true,
          noChange: false,
          lost: true,
        },
        undefined,
      );
    });
  });
  //
  describe('getPositionHistory', () => {
    it('should return position history response', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordId: keywordTest1Mock.id,
        userId: userEntityMock.id,
        period: 'last30days',
        competitorIds: [1, 2],
      } as any;

      const positionHistoryMock = [
        { updateDate: '2024-11-01', position: 1 },
        { updateDate: '2024-11-02', position: 0 },
      ];

      const competitorsHistoryMock = [
        {
          competitorId: 1, //'comp-1',
          history: [{ date: '2024-11-01', position: 3 }],
        },
      ];

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(positionHistoryCacheTransformer, 'cache')
        .mockResolvedValue(positionHistoryMock as any);
      jest
        .spyOn(competitorsService, 'getPositionHistory')
        .mockResolvedValue(competitorsHistoryMock as any);

      const result = await keywordsService.getPositionHistory(payload);

      expect(positionHistoryCacheTransformer.cache).toHaveBeenCalledWith({
        keywordId: payload.keywordId,
        fromDate: expect.any(String),
        toDate: expect.any(String),
      });

      expect(competitorsService.getPositionHistory).toHaveBeenCalledWith(
        payload.keywordId,
        expect.any(String),
        expect.any(String),
        payload.competitorIds,
      );

      expect(result).toEqual(
        new PositionHistoryResponse({
          positionHistory: [
            { date: '2024-11-01', position: 1 },
            { date: '2024-11-02', position: 101 },
          ],
          // @ts-ignore
          historyOfCompetitorPositions: competitorsHistoryMock,
        }),
      );
    });

    it('should throw ForbiddenException if user has no access to the keyword', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordId: keywordTest1Mock.id,
        userId: userEntityMock.id,
        period: 'last30days',
      } as any;

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockRejectedValue(new ForbiddenException('Access denied.'));

      await expect(keywordsService.getPositionHistory(payload)).rejects.toThrow(
        ForbiddenException,
      );

      expect(positionHistoryCacheTransformer.cache).not.toHaveBeenCalled();
      expect(competitorsService.getPositionHistory).not.toHaveBeenCalled();
    });

    it('should handle empty position history result', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordId: keywordTest1Mock.id,
        userId: userEntityMock.id,
        period: 'last7days',
        competitorIds: [],
      } as any;

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(positionHistoryCacheTransformer, 'cache')
        .mockResolvedValue([]);
      jest
        .spyOn(competitorsService, 'getPositionHistory')
        .mockResolvedValue([]);

      const result = await keywordsService.getPositionHistory(payload);

      expect(positionHistoryCacheTransformer.cache).toHaveBeenCalledWith({
        keywordId: payload.keywordId,
        fromDate: expect.any(String),
        toDate: expect.any(String),
      });

      expect(result).toEqual(
        new PositionHistoryResponse({
          positionHistory: [],
          historyOfCompetitorPositions: [],
        }),
      );
    });

    it('should handle empty competitors history when no competitor IDs provided', async () => {
      const payload = {
        accountId: accountEntityMock.id,
        keywordId: keywordTest1Mock.id,
        userId: userEntityMock.id,
        period: 'last7days',
      } as any;

      const positionHistoryMock = [{ updateDate: '2024-11-01', position: 1 }];

      jest
        .spyOn(keywordsService, 'checkIfKeywordsAreRelatedToUserAccount')
        .mockResolvedValue(void 0);
      jest
        .spyOn(positionHistoryCacheTransformer, 'cache')
        .mockResolvedValue(positionHistoryMock as any);
      jest
        .spyOn(competitorsService, 'getPositionHistory')
        .mockResolvedValue([]);

      const result = await keywordsService.getPositionHistory(payload);

      expect(competitorsService.getPositionHistory).not.toHaveBeenCalled();

      expect(result).toEqual(
        new PositionHistoryResponse({
          positionHistory: [{ date: '2024-11-01', position: 1 }],
          historyOfCompetitorPositions: [],
        }),
      );
    });
  });
  //
  describe('getKeywordTrends', () => {
    it('should return keyword trends successfully', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        period: 'last30days',
        deviceType: 'desktop',
      } as any;

      const keywordTrendsMock = [
        { date: '2024-11-01', searchVolume: 100 },
        { date: '2024-11-02', searchVolume: 150 },
      ] as any;

      jest
        .spyOn(keywordTrendsCacheTransformer, 'cache')
        .mockResolvedValue(keywordTrendsMock);

      const result = await keywordsService.getKeywordTrends(payload);

      expect(keywordTrendsCacheTransformer.cache).toHaveBeenCalledWith({
        projectId: payload.projectId,
        fromDate: expect.any(String),
        toDate: expect.any(String),
        deviceType: payload.deviceType,
      });

      expect(result).toEqual(keywordTrendsMock);
    });

    it('should return an empty array if no trends are available', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        period: 'last7days',
        deviceType: 'mobile',
      } as any;

      jest.spyOn(keywordTrendsCacheTransformer, 'cache').mockResolvedValue([]);

      const result = await keywordsService.getKeywordTrends(payload);

      expect(keywordTrendsCacheTransformer.cache).toHaveBeenCalledWith({
        projectId: payload.projectId,
        fromDate: expect.any(String),
        toDate: expect.any(String),
        deviceType: payload.deviceType,
      });

      expect(result).toEqual([]);
    });

    it('should handle invalid period gracefully', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        period: 'invalid-period',
        deviceType: 'desktop',
      } as any;

      const mockFromDate = '2024-10-01';
      const mockToDate = moment().add(1, 'd').format('YYYY-MM-DD');
      const keywordTrendsMock = [{ date: '2024-11-01', searchVolume: 50 }];

      jest.spyOn(helper, 'getStartDate').mockReturnValue(mockFromDate);
      jest
        .spyOn(keywordTrendsCacheTransformer, 'cache')
        .mockResolvedValue(keywordTrendsMock as any);

      const result = await keywordsService.getKeywordTrends(payload);

      expect(keywordTrendsCacheTransformer.cache).toHaveBeenCalledWith({
        projectId: payload.projectId,
        fromDate: mockFromDate,
        toDate: mockToDate,
        deviceType: payload.deviceType,
      });

      expect(result).toEqual(keywordTrendsMock);
    });
  });
  //
  describe('getKeywordsByIdsAndProjectId', () => {
    it('should return keywords when called with valid IDs and project ID', async () => {
      const ids = [1, 2, 3];
      const projectId = projectOneEntityMock.id;
      const expectedKeywords = [
        { ...keywordTest1Mock, projectId },
        { ...keywordTest2Mock, projectId },
      ] as any;

      jest
        .spyOn(keywordRepository, 'getKeywordsByIdsAndProjectId')
        .mockResolvedValue(expectedKeywords);

      const result = await keywordsService.getKeywordsByIdsAndProjectId(
        ids,
        projectId,
      );

      expect(
        keywordRepository.getKeywordsByIdsAndProjectId,
      ).toHaveBeenCalledWith(ids, projectId);
      expect(result).toEqual(expectedKeywords);
    });

    it('should return an empty array if no keywords are found', async () => {
      const ids = [4, 5, 6];
      const projectId = projectOneEntityMock.id;
      jest
        .spyOn(keywordRepository, 'getKeywordsByIdsAndProjectId')
        .mockResolvedValue([]);

      const result = await keywordsService.getKeywordsByIdsAndProjectId(
        ids,
        projectId,
      );

      expect(
        keywordRepository.getKeywordsByIdsAndProjectId,
      ).toHaveBeenCalledWith(ids, projectId);
      expect(result).toEqual([]);
    });
  });
  //
  describe('improvedVsDeclined', () => {
    it('should call cache with correct parameters and return the result', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        period: 'last_30_days',
        deviceType: 'desktop',
      } as any;
      const now = moment().add(1, 'd').format('YYYY-MM-DD');
      const mockFromDate = '2024-10-01';
      const mockResult = [
        { type: 'improved', count: 10 },
        { type: 'declined', count: 5 },
      ] as any;
      jest.spyOn(helper, 'getStartDate').mockReturnValue(mockFromDate);
      jest
        .spyOn(improvedVsDeclinedCacheTransformer, 'cache')
        .mockResolvedValue(mockResult);

      const result = await keywordsService.improvedVsDeclined(payload);

      expect(improvedVsDeclinedCacheTransformer.cache).toHaveBeenCalledWith({
        projectId: payload.projectId,
        fromDate: mockFromDate,
        toDate: now,
        deviceType: payload.deviceType,
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if cache throws an error', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        period: 'last_30_days',
        deviceType: 'desktop',
      } as any;
      const error = new Error('Cache error');
      jest
        .spyOn(improvedVsDeclinedCacheTransformer, 'cache')
        .mockRejectedValue(error);

      await expect(keywordsService.improvedVsDeclined(payload)).rejects.toThrow(
        'Cache error',
      );
      expect(improvedVsDeclinedCacheTransformer.cache).toHaveBeenCalled();
    });
  });
  //
  describe('overview', () => {
    it('should call cache with provided dates if fromDate and toDate are in payload', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        fromDate: '2024-10-01',
        toDate: '2024-11-01',
        deviceType: 'desktop',
      } as any;
      const mockResult = { data: 'overview data' } as any;
      jest
        .spyOn(overviewCacheTransformer, 'cache')
        .mockResolvedValue(mockResult);

      const result = await keywordsService.overview(payload);

      expect(overviewCacheTransformer.cache).toHaveBeenCalledWith({
        ...payload,
        fromDate: payload.fromDate,
        toDate: payload.toDate,
      });
      expect(result).toEqual(mockResult);
    });

    it('should call cache with default dates if no last overview is found', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        deviceType: 'desktop',
      } as any;
      const mockResult = { data: 'overview data' } as any;
      jest
        .spyOn(overviewCacheTransformer, 'cache')
        .mockResolvedValue(mockResult);
      jest
        .spyOn(
          latestProjectOverviewRepository,
          'getCurrentDatesOfLastProjectUpdate',
        )
        .mockResolvedValue(null);

      const expectedFromDate = moment().subtract(1, 'days').toString();
      const expectedToDate = moment().toString();

      const result = await keywordsService.overview(payload);

      expect(
        latestProjectOverviewRepository.getCurrentDatesOfLastProjectUpdate,
      ).toHaveBeenCalledWith(payload.projectId);
      expect(overviewCacheTransformer.cache).toHaveBeenCalledWith({
        ...payload,
        fromDate: expectedFromDate,
        toDate: expectedToDate,
      });
      expect(result).toEqual(mockResult);
    });

    it('should call cache with dates from last overview if available', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        deviceType: 'desktop',
      } as any;
      const mockLastOverview = {
        previousUpdateDate: '2024-09-01',
        updateDate: '2024-10-01',
      } as any;
      const mockResult = { data: 'overview data' };
      jest
        .spyOn(overviewCacheTransformer, 'cache')
        .mockResolvedValue(mockResult as any);
      jest
        .spyOn(
          latestProjectOverviewRepository,
          'getCurrentDatesOfLastProjectUpdate',
        )
        .mockResolvedValue(mockLastOverview);

      // Act
      const result = await keywordsService.overview(payload);

      // Assert
      expect(
        latestProjectOverviewRepository.getCurrentDatesOfLastProjectUpdate,
      ).toHaveBeenCalledWith(payload.projectId);
      expect(overviewCacheTransformer.cache).toHaveBeenCalledWith({
        ...payload,
        fromDate: mockLastOverview.previousUpdateDate.toString(),
        toDate: mockLastOverview.updateDate.toString(),
      });
      expect(result).toEqual(mockResult);
    });

    it('should throw an error if cache throws', async () => {
      const payload = {
        projectId: projectOneEntityMock.id,
        fromDate: '2024-10-01',
        toDate: '2024-11-01',
        deviceType: 'desktop',
      } as any;
      const error = new Error('Cache error');
      jest.spyOn(overviewCacheTransformer, 'cache').mockRejectedValue(error);

      await expect(keywordsService.overview(payload)).rejects.toThrow(
        'Cache error',
      );
      expect(overviewCacheTransformer.cache).toHaveBeenCalledWith({
        ...payload,
        fromDate: payload.fromDate,
        toDate: payload.toDate,
      });
    });
  });
  //
  describe('getNumberOfWordsThatWillBeSkipped', () => {
    it('should return the correct number of skipped words', async () => {
      const projectIds = [1, 2, 3];
      const mockNumberOfKeywordsToBeUpdated = 20;
      const mockAllKeywords = 50;

      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywordsToUpdate')
        .mockResolvedValue(mockNumberOfKeywordsToBeUpdated);
      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywords')
        .mockResolvedValue(mockAllKeywords);

      const expectedResult = mockAllKeywords - mockNumberOfKeywordsToBeUpdated;

      const result = await keywordsService.getNumberOfWordsThatWillBeSkipped(
        projectIds,
      );

      expect(
        keywordRepository.getNumberOfProjectsKeywordsToUpdate,
      ).toHaveBeenCalledWith(projectIds);
      expect(
        keywordRepository.getNumberOfProjectsKeywords,
      ).toHaveBeenCalledWith(projectIds);
      expect(result).toBe(expectedResult);
    });

    it('should return 0 if there are no keywords', async () => {
      const projectIds = [1, 2, 3];
      const mockNumberOfKeywordsToBeUpdated = 0;
      const mockAllKeywords = 0;

      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywordsToUpdate')
        .mockResolvedValue(mockNumberOfKeywordsToBeUpdated);
      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywords')
        .mockResolvedValue(mockAllKeywords);

      const result = await keywordsService.getNumberOfWordsThatWillBeSkipped(
        projectIds,
      );

      expect(result).toBe(0);
    });

    it('should return 0 if all keywords are updated', async () => {
      const projectIds = [1, 2, 3];
      const mockNumberOfKeywordsToBeUpdated = 50;
      const mockAllKeywords = 50;

      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywordsToUpdate')
        .mockResolvedValue(mockNumberOfKeywordsToBeUpdated);
      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywords')
        .mockResolvedValue(mockAllKeywords);

      const result = await keywordsService.getNumberOfWordsThatWillBeSkipped(
        projectIds,
      );

      expect(result).toBe(0);
    });

    it('should handle negative numbers if repository returns invalid data', async () => {
      const projectIds = [1, 2, 3];
      const mockNumberOfKeywordsToBeUpdated = 60;
      const mockAllKeywords = 50;

      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywordsToUpdate')
        .mockResolvedValue(mockNumberOfKeywordsToBeUpdated);
      jest
        .spyOn(keywordRepository, 'getNumberOfProjectsKeywords')
        .mockResolvedValue(mockAllKeywords);

      const result = await keywordsService.getNumberOfWordsThatWillBeSkipped(
        projectIds,
      );

      expect(result).toBe(-10);
    });
  });
  //
});
