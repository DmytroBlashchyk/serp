import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { Job, Queue } from 'bull';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { CompetitorsService } from 'modules/competitors/services/competitors.service';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { EventBus } from '@nestjs/cqrs';
import { BaseQueue } from 'modules/queue/queues/base.queue';
import { CreateTriggerInitializationEvent } from 'modules/triggers/events/create-trigger-initialization.event';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { App } from 'modules/queue/enums/app.enum';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';
import { UpdateDataForKeywordRankingsEvent } from 'modules/keywords/events/update-data-for-keyword-rankings.event';
import { GetCPCAndSearchVolumeEvent } from 'modules/keywords/events/get-cPC-and-search-volume.event';

@Processor(Queues.UpdateKeywordPosition)
export class UpdateKeywordPositionsQueue extends BaseQueue {
  constructor(
    private readonly keywordRepository: KeywordRepository,
    private readonly competitorsService: CompetitorsService,
    private readonly searchResultRepository: SearchResultRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly desktopTypesRepository: DeviceTypesRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly competitorKeywordPositionRepository: CompetitorKeywordPositionRepository,
    private readonly keywordPositionsForDayRepository: KeywordPositionsForDayRepository,
    private readonly eventBus: EventBus,
    protected readonly cliLoggingService: CliLoggingService,
    private readonly accountLimitsService: AccountLimitsService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
    @InjectQueue(Queues.Projects)
    private readonly projectsQueue: Queue,
  ) {
    super(cliLoggingService);
  }

  /**
   * Fetches CPC (Cost Per Click) and search volume for specified keywords.
   *
   * @param {Job} job - Job object containing data with keyword IDs and project ID.
   * @return {Promise<void>} A promise that resolves when the event has been published successfully.
   */
  @Process({ name: QueueEventEnum.GetCPCAndSearchVolume })
  async getCPCAndSearchVolume(job: Job): Promise<void> {
    await this.eventBus.publish(
      new GetCPCAndSearchVolumeEvent({
        keywordIds: job.data.keywordIds,
        projectId: job.data.projectId,
      }),
    );
  }

  /**
   * Manually updates keyword positions in live mode for YouTube.
   *
   * @param {Job} job - The job containing keyword update details.
   * @return {Promise<void>} A promise that resolves when the update is completed.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesInLiveModeForYoutube,
    concurrency: 6000,
  })
  async manualKeywordUpdatesInLiveModeForYoutube(job: Job) {
    this.cliLoggingService.log(
      'Start: manualKeywordUpdatesInLiveModeForYoutube',
    );
    try {
      const keywordId = job.data.keywordId;
      const isManual = job.data.isManual;
      await this.keywordRepository.startUpdatingKeywords([keywordId], isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: [keywordId],
        }),
      );
      const project = await this.projectRepository.getKeywordGroupedByProject(
        keywordId,
      );

      if (project?.keywords.length) {
        const keywordPositions = [];
        const competitorsPositions = [];
        const searchResult = [];
        const updatedKeywordIds = [];
        const itemResult =
          await this.dataForSeoService.updateKeywordsUsingLiveModeForYoutube(
            project,
            project.keywords[0].deviceType,
            project.keywords[0],
          );

        const dataItem =
          await this.dataForSeoService.processSearchResultForYoutube(
            itemResult,
            project,
          );

        keywordPositions.push({
          keyword: {
            id: project.keywords[0].id,
          },
          position: dataItem.position <= 101 ? dataItem.position : 101,
          url: dataItem.url,
        });
        await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
          project.keywords[0].id,
          dataItem.position,
          dataItem.url,
          new Date(),
        );
        searchResult.push({
          keyword: { id: project.keywords[0].id },
          result: dataItem.searchResult,
        });
        updatedKeywordIds.push(project.keywords[0].id);
        if (dataItem.dataCompetitors.length > 0) {
          for (const item of dataItem.dataCompetitors) {
            competitorsPositions.push({
              keyword: { id: project.keywords[0].id },
              competitor: { id: item.id },
              position: item.position <= 101 ? item.position : 101,
            });
          }
        }
        await this.searchResultRepository.save(searchResult);
        if (competitorsPositions.length > 0) {
          await this.competitorKeywordPositionRepository.save(
            competitorsPositions,
          );
        }
        await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);

        await this.eventBus.publish(
          new UpdateDataForKeywordRankingsEvent({
            keywordIds: updatedKeywordIds,
          }),
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesInLiveModeForYoutube',
        error,
      );
    }
  }

  /**
   * Handles manual keyword updates in live mode specifically for Google Maps.
   * This function fetches and updates keyword positions and related data using the live mode.
   * It also publishes necessary events and updates the project schedules accordingly.
   *
   * @param {Job} job - The job containing data related to keyword updates, including keywordId and isManual properties.
   * @return {Promise<void>} - A promise that resolves when the keyword updates process is complete.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleMaps,
    concurrency: 6000,
  })
  async manualKeywordUpdatesInLiveModeForGoogleMaps(job: Job): Promise<void> {
    this.cliLoggingService.log(
      'Start: manualKeywordUpdatesInLiveModeForGoogleMaps',
    );
    try {
      const keywordId = job.data.keywordId;
      const isManual = job.data.isManual;
      await this.keywordRepository.startUpdatingKeywords([keywordId], isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: [keywordId],
        }),
      );
      const project = await this.projectRepository.getKeywordGroupedByProject(
        keywordId,
      );
      if (project?.keywords.length) {
        const keywordPositions = [];
        const competitorsPositions = [];
        const searchResult = [];
        const updatedKeywordIds = [];

        const itemResult =
          await this.dataForSeoService.updateKeywordsUsingLiveModeForGoogleMaps(
            project,
            project.keywords[0].deviceType,
            project.keywords[0],
          );
        const dataItem =
          await this.dataForSeoService.processSearchResultForGoogleMaps(
            itemResult,
            project,
          );
        keywordPositions.push({
          keyword: {
            id: project.keywords[0].id,
          },
          position: dataItem.position <= 101 ? dataItem.position : 101,
          url: dataItem.url,
        });
        await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
          project.keywords[0].id,
          dataItem.position,
          dataItem.url,
          new Date(),
        );
        searchResult.push({
          keyword: { id: project.keywords[0].id },
          result: dataItem.searchResult,
        });
        updatedKeywordIds.push(project.keywords[0].id);
        if (dataItem.dataCompetitors.length > 0) {
          for (const item of dataItem.dataCompetitors) {
            competitorsPositions.push({
              keyword: { id: project.keywords[0].id },
              competitor: { id: item.id },
              position: item.position <= 101 ? item.position : 101,
            });
          }
        }
        await this.searchResultRepository.save(searchResult);
        if (competitorsPositions.length > 0) {
          await this.competitorKeywordPositionRepository.save(
            competitorsPositions,
          );
        }
        await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);
        await this.eventBus.publish(
          new UpdateDataForKeywordRankingsEvent({
            keywordIds: updatedKeywordIds,
          }),
        );
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
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesInLiveModeForGoogleMaps',
        error,
      );
    }
  }

  /**
   * Manually updates keyword rankings in live mode for Google Local.
   *
   * @param {Job} job - The job object containing keywordId and isManual properties.
   * @return {Promise<void>} - A promise that resolves when the update process is complete.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesInLiveModeForGoogleLocal,
    concurrency: 6000,
  })
  async manualKeywordUpdatesInLiveModeForGoogleLocal(job: Job) {
    try {
      const keywordId = job.data.keywordId;
      const isManual = job.data.isManual;
      await this.keywordRepository.startUpdatingKeywords([keywordId], isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: [keywordId],
        }),
      );
      const project = await this.projectRepository.getKeywordGroupedByProject(
        keywordId,
      );
      if (project?.keywords.length) {
        const keywordPositions = [];
        const competitorsPositions = [];
        const searchResult = [];
        const updatedKeywordIds = [];

        const itemResult =
          await this.dataForSeoService.updateKeywordsUsingLiveModeForLocalFinder(
            project,
            project.keywords[0].deviceType,
            project.keywords[0],
          );
        const dataItem =
          await this.dataForSeoService.processSearchResultForGoogleLocal(
            itemResult,
            project,
          );
        keywordPositions.push({
          keyword: {
            id: project.keywords[0].id,
          },
          position: dataItem.position <= 101 ? dataItem.position : 101,
          url: dataItem.url,
        });
        await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
          project.keywords[0].id,
          dataItem.position,
          dataItem.url,
          new Date(),
        );
        searchResult.push({
          keyword: { id: project.keywords[0].id },
          result: dataItem.searchResult,
        });
        updatedKeywordIds.push(project.keywords[0].id);
        if (dataItem.dataCompetitors.length > 0) {
          for (const item of dataItem.dataCompetitors) {
            competitorsPositions.push({
              keyword: { id: project.keywords[0].id },
              competitor: { id: item.id },
              position: item.position <= 101 ? item.position : 101,
            });
          }
        }
        await this.searchResultRepository.save(searchResult);
        if (competitorsPositions.length > 0) {
          await this.competitorKeywordPositionRepository.save(
            competitorsPositions,
          );
        }
        await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);

        await this.eventBus.publish(
          new UpdateDataForKeywordRankingsEvent({
            keywordIds: updatedKeywordIds,
          }),
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesInLiveModeForGoogleLocal',
        error,
      );
    }
  }

  /**
   * Manages manual keyword updates in live mode for Yahoo search engine.
   *
   * @param {Job} job - The job data which contains the keywordId and isManual flag.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesInLiveModeForYahoo,
    concurrency: 6000,
  })
  async manualKeywordUpdatesInLiveModeForYahoo(job: Job): Promise<void> {
    try {
      const keywordId = job.data.keywordId;
      const isManual = job.data.isManual;
      await this.keywordRepository.startUpdatingKeywords([keywordId], isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: [keywordId],
        }),
      );
      const project = await this.projectRepository.getKeywordGroupedByProject(
        keywordId,
      );

      if (project?.keywords.length) {
        const keywordPositions = [];
        const competitorsPositions = [];
        const searchResult = [];
        const updatedKeywordIds = [];

        const itemResult =
          await this.dataForSeoService.updateKeywordsUsingLiveModeForYahoo(
            project,
            project.keywords[0].deviceType,
            project.keywords[0],
          );

        const dataItem =
          await this.dataForSeoService.processSearchResultForYahoo(
            itemResult,
            project,
          );
        keywordPositions.push({
          keyword: {
            id: project.keywords[0].id,
          },
          position: dataItem.position <= 101 ? dataItem.position : 101,
          url: dataItem.url,
        });
        await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
          project.keywords[0].id,
          dataItem.position,
          dataItem.url,
          new Date(),
        );
        searchResult.push({
          keyword: { id: project.keywords[0].id },
          result: dataItem.searchResult,
        });
        updatedKeywordIds.push(project.keywords[0].id);
        if (dataItem.dataCompetitors.length > 0) {
          for (const item of dataItem.dataCompetitors) {
            competitorsPositions.push({
              keyword: { id: project.keywords[0].id },
              competitor: { id: item.id },
              position: item.position <= 101 ? item.position : 101,
            });
          }
        }
        await this.searchResultRepository.save(searchResult);
        if (competitorsPositions.length > 0) {
          await this.competitorKeywordPositionRepository.save(
            competitorsPositions,
          );
        }
        await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);

        await this.eventBus.publish(
          new UpdateDataForKeywordRankingsEvent({
            keywordIds: updatedKeywordIds,
          }),
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesInLiveModeForYahoo',
        error,
      );
    }
  }

  /**
   * Handles manual keyword updates in live mode specifically for Bing.
   * This process involves updating the keyword's position, handling competitor positions, and saving search results.
   *
   * @param {object} job - The job object containing data for the keyword update process.
   * @param {number} job.data.keywordId - The ID of the keyword to be updated.
   * @param {boolean} job.data.isManual - A flag indicating if the update is manual.
   * @return {Promise<void>} - A promise that resolves when the update process completes.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesInLiveModeForBing,
    concurrency: 6000,
  })
  async manualKeywordUpdatesInLiveModeForBing(job: Job): Promise<void> {
    try {
      const keywordId = job.data.keywordId;
      const isManual = job.data.isManual;
      await this.keywordRepository.startUpdatingKeywords([keywordId], isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: [keywordId],
        }),
      );
      const project = await this.projectRepository.getKeywordGroupedByProject(
        keywordId,
      );

      if (project?.keywords.length) {
        const keywordPositions = [];
        const competitorsPositions = [];
        const searchResult = [];
        const updatedKeywordIds = [];

        const itemResult =
          await this.dataForSeoService.updateKeywordsUsingLiveModeForBing(
            project,
            project.keywords[0].deviceType,
            project.keywords[0],
          );

        const dataItem =
          await this.dataForSeoService.processSearchResultForBing(
            itemResult,
            project,
          );
        keywordPositions.push({
          keyword: {
            id: project.keywords[0].id,
          },
          position: dataItem.position <= 101 ? dataItem.position : 101,
          url: dataItem.url,
        });
        await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
          project.keywords[0].id,
          dataItem.position,
          dataItem.url,
          new Date(),
        );
        searchResult.push({
          keyword: { id: project.keywords[0].id },
          result: dataItem.searchResult,
        });
        updatedKeywordIds.push(project.keywords[0].id);
        if (dataItem.dataCompetitors.length > 0) {
          for (const item of dataItem.dataCompetitors) {
            competitorsPositions.push({
              keyword: { id: project.keywords[0].id },
              competitor: { id: item.id },
              position: item.position <= 101 ? item.position : 101,
            });
          }
        }

        await this.searchResultRepository.save(searchResult);
        if (competitorsPositions.length > 0) {
          await this.competitorKeywordPositionRepository.save(
            competitorsPositions,
          );
        }
        await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);

        await this.eventBus.publish(
          new UpdateDataForKeywordRankingsEvent({
            keywordIds: updatedKeywordIds,
          }),
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesInLiveModeForBing',
        error,
      );
    }
  }

  /**
   * Manually updates keyword positions in live mode.
   *
   * @param {Job} job - The job containing keyword updating parameters and options.
   * @return {Promise<void>} A promise that resolves when the keyword update process completes.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesInLiveMode,
    concurrency: 6000,
  })
  async manualKeywordUpdatesInLiveMode(job: Job) {
    this.cliLoggingService.log('Start: manualKeywordUpdatesInLiveMode');
    try {
      const keywordId = job.data.keywordId;
      const isManual = job.data.isManual;
      await this.keywordRepository.startUpdatingKeywords([keywordId], isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: [keywordId],
        }),
      );
      const project = await this.projectRepository.getKeywordGroupedByProject(
        keywordId,
      );
      if (project?.keywords.length) {
        const keywordPositions = [];
        const competitorsPositions = [];
        const searchResult = [];
        const updatedKeywordIds = [];

        const itemResult =
          await this.dataForSeoService.updateKeywordsUsingLiveMode(
            project,
            project.keywords[0].deviceType,
            project.keywords[0],
          );
        const dataItem = await this.dataForSeoService.processSearchResult(
          itemResult,
          project,
        );
        keywordPositions.push({
          keyword: {
            id: project.keywords[0].id,
          },
          position: dataItem.position <= 101 ? dataItem.position : 101,
          url: dataItem.url,
        });
        await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
          project.keywords[0].id,
          dataItem.position,
          dataItem.url,
          new Date(),
        );
        searchResult.push({
          keyword: { id: project.keywords[0].id },
          result: dataItem.searchResult,
        });
        updatedKeywordIds.push(project.keywords[0].id);
        if (dataItem.dataCompetitors.length > 0) {
          for (const item of dataItem.dataCompetitors) {
            competitorsPositions.push({
              keyword: { id: project.keywords[0].id },
              competitor: { id: item.id },
              position: item.position <= 101 ? item.position : 101,
            });
          }
        }
        await this.searchResultRepository.save(searchResult);
        if (competitorsPositions.length > 0) {
          await this.competitorKeywordPositionRepository.save(
            competitorsPositions,
          );
        }
        await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);

        await this.eventBus.publish(
          new UpdateDataForKeywordRankingsEvent({
            keywordIds: updatedKeywordIds,
          }),
        );
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesInLiveMode',
        error,
      );
    }
  }

  /**
   * Manually triggers keyword updates for YouTube projects. This method
   * handles starting the update process, publishing initialization events,
   * and adding update jobs to the queue. It then processes the keywords
   * grouped by their respective projects and manages account quota usage.
   *
   * @param {Job} job - Job instance containing the data required for keyword updates.
   * @return {Promise<void>} Resolves when the keyword update process is complete.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesForYoutube,
    concurrency: 5,
  })
  async manualKeywordUpdatesForYoutube(job: Job) {
    const isManual = job.data.isManual;
    await this.keywordRepository.startUpdatingKeywords(
      job.data.keywordIds,
      isManual,
    );
    await this.eventBus.publish(
      new CreateTriggerInitializationEvent({
        keywordIds: job.data.keywordIds,
      }),
    );
    await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
      keywordIds: job.data.keywordIds,
    });
    const result = await this.projectRepository.getKeywordsGroupedByProject(
      job.data.keywordIds,
    );

    for (const project of result) {
      if (project.keywords.length) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length * 5,
        );
        const desktopKeywords = project.keywords.filter(
          (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
        );
        if (desktopKeywords.length) {
          const deviceType =
            await this.desktopTypesRepository.getDeviceTypeByName(
              DeviceTypesEnum.Desktop,
            );
          await this.dataForSeoService.updateKeywordsUsingPriorityQueueForYoutube(
            project,
            deviceType,
            desktopKeywords,
          );
        }
      }
    }
  }

  /**
   * Handle manual keyword updates for Google Maps by processing the provided job.
   *
   * This method starts the keyword updating process, triggers necessary events,
   * and takes into account quota usage for keyword updates. It also filters
   * the keywords by device type and updates them using the appropriate priority queue.
   *
   * @param {Job} job - The job containing data for manual keyword updates, including keyword IDs and a flag indicating if the update is manual.
   * @return {Promise<void>} - A promise that resolves when the manual keyword update process is completed.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesForGoogleMaps,
    concurrency: 5,
  })
  async manualKeywordUpdatesForGoogleMaps(job: Job) {
    const isManual = job.data.isManual;
    await this.keywordRepository.startUpdatingKeywords(
      job.data.keywordIds,
      isManual,
    );
    await this.eventBus.publish(
      new CreateTriggerInitializationEvent({
        keywordIds: job.data.keywordIds,
      }),
    );
    await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
      keywordIds: job.data.keywordIds,
    });
    const result = await this.projectRepository.getKeywordsGroupedByProject(
      job.data.keywordIds,
    );

    for (const project of result) {
      if (project.keywords.length) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length,
        );
        const desktopKeywords = project.keywords.filter(
          (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
        );
        if (desktopKeywords.length) {
          const deviceType =
            await this.desktopTypesRepository.getDeviceTypeByName(
              DeviceTypesEnum.Desktop,
            );
          await this.dataForSeoService.updateKeywordsUsingPriorityQueueForGoogleMaps(
            project,
            deviceType,
            desktopKeywords,
          );
        }
      }
    }
  }

  /**
   * Handles the manual update of keywords for Google Local by starting the keyword update process,
   * publishing the trigger initialization event, and adding a start keyword update event to the queue.
   * Additionally, it takes into account the quota of keyword updates after saving results
   * and updates keywords using the priority queue for Google Local.
   *
   * @param {Job} job - The job object that contains the data for manually updating keywords, including
   *                    keyword IDs and a flag indicating if the update is manual.
   * @return {Promise<void>} - A promise that resolves when the keyword update process is completed.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesForGoogleLocal,
    concurrency: 5,
  })
  async manualKeywordUpdatesForGoogleLocal(job: Job): Promise<void> {
    const isManual = job.data.isManual;
    await this.keywordRepository.startUpdatingKeywords(
      job.data.keywordIds,
      isManual,
    );
    await this.eventBus.publish(
      new CreateTriggerInitializationEvent({
        keywordIds: job.data.keywordIds,
      }),
    );
    await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
      keywordIds: job.data.keywordIds,
    });
    const result = await this.projectRepository.getKeywordsGroupedByProject(
      job.data.keywordIds,
    );

    for (const project of result) {
      if (project.keywords.length) {
        await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
          project.account.id,
          project.keywords.length * 5,
        );
        const desktopKeywords = project.keywords.filter(
          (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
        );
        if (desktopKeywords.length) {
          const deviceType =
            await this.desktopTypesRepository.getDeviceTypeByName(
              DeviceTypesEnum.Desktop,
            );
          await this.dataForSeoService.updateKeywordsUsingPriorityQueueForGoogleLocal(
            project,
            deviceType,
            desktopKeywords,
          );
        }
      }
    }
  }

  /**
   * Handles manual keyword updates for Yahoo based on the provided job information.
   * This function processes the keyword updates by using Yahoo's priority queue.
   *
   * @param {Job} job - The job object that contains keyword IDs and a boolean indicating if the update is manual.
   * @return {Promise<void>} A promise that resolves when the keyword update process is complete.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesForYahoo,
    concurrency: 5,
  })
  async manualKeywordUpdatesForYahoo(job: Job): Promise<void> {
    try {
      const keywordIds = job.data.keywordIds;
      const isManual = job.data.isManual;

      await this.keywordRepository.startUpdatingKeywords(keywordIds, isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds,
        }),
      );

      await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
        keywordIds,
      });
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        keywordIds,
      );
      for (const project of result) {
        if (project.keywords.length) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            project.account.id,
            project.keywords.length,
          );
          const desktopKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
          );
          if (desktopKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Desktop,
              );
            await this.dataForSeoService.updateKeywordsUsingPriorityQueueForYahoo(
              project,
              deviceType,
              desktopKeywords,
            );
          }
          const mobileKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Mobile,
          );
          if (mobileKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Mobile,
              );

            await this.dataForSeoService.updateKeywordsUsingPriorityQueueForYahoo(
              project,
              deviceType,
              mobileKeywords,
            );
          }
        }
      }
    } catch (error) {
      this.cliLoggingService.error(
        'Error: manualKeywordUpdatesForYahoo',
        error,
      );
    }
  }

  /**
   * Initiates the manual update of keywords for Baidu. It updates the keywords,
   * triggers the necessary initialization events, and processes keyword updates for
   * desktop and mobile devices.
   *
   * @param {Job} job - The job object containing data for manual keyword updates, including keyword IDs and whether the update is manual.
   * @return {Promise<void>} - A promise that resolves when the manual keyword update process for Baidu is complete.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdatesForBaidu,
    concurrency: 5,
  })
  async manualKeywordUpdatesForBaidu(job: Job): Promise<void> {
    try {
      const keywordIds = job.data.keywordIds;
      const isManual = job.data.isManual;

      await this.keywordRepository.startUpdatingKeywords(keywordIds, isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds,
        }),
      );

      await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
        keywordIds,
      });
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        keywordIds,
      );
      for (const project of result) {
        if (project.keywords.length) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            project.account.id,
            project.keywords.length,
          );
          const desktopKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
          );
          if (desktopKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Desktop,
              );
            await this.dataForSeoService.updateKeywordsUsingPriorityQueueForBaidu(
              project,
              deviceType,
              desktopKeywords,
            );
          }
          const mobileKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Mobile,
          );
          if (mobileKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Mobile,
              );

            await this.dataForSeoService.updateKeywordsUsingPriorityQueueForBaidu(
              project,
              deviceType,
              mobileKeywords,
            );
          }
        }
      }
    } catch (error) {
      this.cliLoggingService.error('Error: manualKeywordUpdatesForBing', error);
    }
  }

  /**
   * This method handles the manual keyword updates specifically for Bing.
   * It starts the update process for the provided keyword IDs, triggers necessary events,
   * and processes the keywords grouped by their respective projects to update them for both
   * desktop and mobile types using DataForSeo service.
   * It also takes into account the quotas for keyword updates after saving results.
   *
   * @param {Job} job The job instance containing data for the keyword update process.
   * @return {Promise<void>} A promise that resolves when the keyword update process is complete.
   */
  @Process({ name: QueueEventEnum.ManualKeywordUpdatesForBing, concurrency: 5 })
  async manualKeywordUpdatesForBing(job: Job): Promise<void> {
    try {
      const keywordIds = job.data.keywordIds;
      const isManual = job.data.isManual;

      await this.keywordRepository.startUpdatingKeywords(keywordIds, isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds,
        }),
      );

      await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
        keywordIds,
      });
      const result = await this.projectRepository.getKeywordsGroupedByProject(
        keywordIds,
      );
      for (const project of result) {
        if (project.keywords.length) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            project.account.id,
            project.keywords.length,
          );
          const desktopKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
          );
          if (desktopKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Desktop,
              );
            await this.dataForSeoService.updateKeywordsUsingPriorityQueueForBing(
              project,
              deviceType,
              desktopKeywords,
            );
          }
          const mobileKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Mobile,
          );
          if (mobileKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Mobile,
              );

            await this.dataForSeoService.updateKeywordsUsingPriorityQueueForBing(
              project,
              deviceType,
              mobileKeywords,
            );
          }
        }
      }
    } catch (error) {
      this.cliLoggingService.error('Error: manualKeywordUpdatesForBing', error);
    }
  }

  /**
   * Processes manual keyword updates by initiating keyword updates, publishing related events,
   * and managing keyword update quotas. Segregates and updates keywords based on their device types
   * such as Desktop and Mobile.
   *
   * @param {Job} job - The job containing details about the manual keyword update, including keyword IDs and manual update flag.
   * @return {Promise<void>} A promise that resolves when the manual keyword update process completes.
   */
  @Process({
    name: QueueEventEnum.ManualKeywordUpdates,
    concurrency: 5,
  })
  async manualKeywordUpdates(job: Job): Promise<void> {
    try {
      const keywordIds = job.data.keywordIds;
      const isManual = job.data.isManual;

      await this.keywordRepository.startUpdatingKeywords(keywordIds, isManual);
      await this.eventBus.publish(
        new CreateTriggerInitializationEvent({
          keywordIds: keywordIds,
        }),
      );

      await this.keywordQueue.add(AppEventEnum.StartOfKeywordUpdate, {
        keywordIds,
      });

      const result = await this.projectRepository.getKeywordsGroupedByProject(
        keywordIds,
      );

      for (const project of result) {
        if (project.keywords.length) {
          await this.accountLimitsService.takeIntoAccountQuotaOfKeywordUpdatesAfterSavingResults(
            project.account.id,
            project.keywords.length,
          );
          const desktopKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Desktop,
          );
          if (desktopKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Desktop,
              );
            await this.dataForSeoService.updateKeywordsUsingPriorityQueue(
              project,
              deviceType,
              desktopKeywords,
            );
          }
          const mobileKeywords = project.keywords.filter(
            (keyword) => keyword.deviceType.name === DeviceTypesEnum.Mobile,
          );
          if (mobileKeywords.length) {
            const deviceType =
              await this.desktopTypesRepository.getDeviceTypeByName(
                DeviceTypesEnum.Mobile,
              );

            await this.dataForSeoService.updateKeywordsUsingPriorityQueue(
              project,
              deviceType,
              mobileKeywords,
            );
          }
        }
      }
    } catch (error) {
      this.cliLoggingService.error('Error: manualKeywordUpdates', error);
    }
  }

  /**
   * Updates keyword positions using a priority queue.
   *
   * @param {Job} job - The job containing data such as device type name, project ID, and keywords.
   * @return {Promise<void>} - Returns a promise that resolves when the keywords have been updated.
   */
  @Process({
    name: QueueEventEnum.UpdateKeywordPositionsUsingPriorityQueue,
    concurrency: 1,
  })
  async updateKeywordPositionsUsingPriorityQueue(job: Job) {
    const deviceType = await this.desktopTypesRepository.getDeviceTypeByName(
      job.data.deviceTypeName,
    );
    const project = await this.projectRepository.getProjectByIdWithRelations(
      job.data.projectId,
    );

    await this.dataForSeoService.updateKeywordsUsingPriorityQueue(
      project,
      deviceType,
      job.data.keywords,
    );
  }

  /**
   * Processes the results of updating keyword positions using a priority queue.
   *
   * @param {Job} job - The job containing data about the project and keyword(s).
   * @return {Promise<void>} A promise that resolves when processing is complete.
   */
  @Process({
    name: QueueEventEnum.ProcessingResultsOfUpdatingKeywordPositionsUsingPriorityQueue,
    concurrency: 1,
  })
  async processingResultsOfUpdatingKeywordPositionsUsingPriorityQueue(
    job: Job,
  ) {
    const project = await this.projectRepository.getProjectByIdWithRelations(
      job.data.projectId,
    );
    const keyword = await this.keywordRepository.getKeywordById(
      job.data.keywordId,
    );
    const keywordPositions = [];
    const competitorsPositions = [];
    const searchResult = [];
    const updatedKeywordIds = [];
    const dataItem = await this.dataForSeoService.processSearchResult(
      job.data.items,
      project,
    );
    keywordPositions.push({
      keyword: {
        id: keyword.id,
      },
      position: dataItem.position <= 101 ? dataItem.position : 101,
      url: dataItem.url,
    });

    await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
      keyword.id,
      dataItem.position <= 101 ? dataItem.position : 101,
      dataItem.url,
      new Date(),
    );
    searchResult.push({
      keyword: { id: keyword.id },
      result: dataItem.searchResult,
    });
    updatedKeywordIds.push(keyword.id);
    if (dataItem.dataCompetitors.length > 0) {
      for (const item of dataItem.dataCompetitors) {
        competitorsPositions.push({
          keyword: { id: keyword.id },
          competitor: { id: item.id },
          position: item.position <= 101 ? item.position : 101,
        });
      }
    }
    await this.searchResultRepository.save(searchResult);
    if (competitorsPositions.length > 0) {
      await this.competitorKeywordPositionRepository.save(competitorsPositions);
    }
    await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);
  }

  /**
   * Updates the positions of keywords using live mode.
   *
   * @param {Job} job - The job containing necessary data for updating keyword positions.
   * @return {Promise<void>} A promise that resolves when the keyword positions have been updated.
   */
  @Process({
    name: QueueEventEnum.UpdateKeywordPositionsUsingLiveMode,
    concurrency: 1,
  })
  async updateKeywordPositionsUsingLiveMode(job: Job): Promise<void> {
    const deviceType = await this.desktopTypesRepository.getDeviceTypeByName(
      job.data.deviceTypeName,
    );
    const project = await this.projectRepository.getProjectByIdWithRelations(
      job.data.projectId,
    );
    const keywordPositions = [];
    const competitorsPositions = [];
    const searchResult = [];
    const updatedKeywordIds = [];

    for (const keyword of job.data.keywords) {
      const result = await this.dataForSeoService.updateKeywordsUsingLiveMode(
        project,
        deviceType,
        keyword,
      );

      const dataItem = await this.dataForSeoService.processSearchResult(
        result,
        project,
      );
      keywordPositions.push({
        keyword: {
          id: keyword.id,
        },
        position: dataItem.position <= 101 ? dataItem.position : 101,
        url: dataItem.url,
      });
      await this.keywordPositionsForDayRepository.addOrUpdateLastKeywordPositionForDay(
        keyword.id,
        dataItem.position,
        dataItem.url,
        new Date(),
      );
      searchResult.push({
        keyword: { id: keyword.id },
        result: dataItem.searchResult,
      });
      updatedKeywordIds.push(keyword.id);
      if (dataItem.dataCompetitors.length > 0) {
        for (const item of dataItem.dataCompetitors) {
          competitorsPositions.push({
            keyword: { id: keyword.id },
            competitor: { id: item.id },
            position: item.position <= 101 ? item.position : 101,
          });
        }
      }
    }

    await this.searchResultRepository.save(searchResult);
    if (competitorsPositions.length > 0) {
      await this.competitorKeywordPositionRepository.save(competitorsPositions);
    }
    await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);
  }

  /**
   * Update projects based on the provided keyword IDs.
   *
   * @param {Job<any>} job - The job object containing data payload, specifically the keyword IDs.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  @Process({
    name: QueueEventEnum.UpdateProjectsByKeywordIds,
    concurrency: 6,
  })
  async updateProjectsByIds(job: Job<any>) {
    await this.projectRepository.updateProjectsByKeywordIds(job.data.ids);
  }

  /**
   * Handles the job for updating position updates of keywords.
   *
   * @param {Job<any>} job - The job containing the data needed for updating position updates.
   * @return {Promise<void>} - A promise that resolves when the position updates have been successfully updated.
   */
  @Process({
    name: QueueEventEnum.UpdatePositionUpdate,
    concurrency: 5,
  })
  async updatePositionUpdate(job: Job<any>) {
    await this.keywordRepository.updatePositionUpdate(
      job.data.keywords.map((keyword: { id: IdType }) => keyword.id),
      false,
    );
  }

  /**
   * Processes the job to create keyword results and stores them in the search result repository.
   *
   * @param {Job<any>} job - The job containing the data needed to create keyword results.
   * @return {Promise<void>} - A promise that resolves when the keyword results have been created.
   */
  @Process({
    name: QueueEventEnum.CreateKeywordsResults,
    concurrency: 3,
  })
  async createKeywordsResults(job: Job<any>) {
    await this.searchResultRepository.createKeywordsResults(
      job.data.searchResult,
    );
  }

  /**
   * Determines the position of competitor's keywords using the given job.
   *
   * @param {Job<any>} job - The job object containing the keywordId as part of its data.
   * @return {Promise<void>} A promise that resolves when the competitor's keyword position has been determined.
   */
  @Process({
    name: QueueEventEnum.DeterminePositionOfCompetitorsKeywords,
    concurrency: 2,
  })
  async determinePositionOfCompetitorsKeywords(job: Job<any>) {
    await this.competitorsService.determinePositionOfCompetitorsKeywords(
      job.data.keywordId,
    );
  }
}
