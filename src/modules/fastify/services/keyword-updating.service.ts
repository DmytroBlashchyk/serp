import { Injectable } from '@nestjs/common';
import { parseTagString } from 'modules/common/utils/parseTagString';
import { TaskRequest } from 'modules/fastify/requests/task.request';
import { ProjectRepository } from 'modules/projects/repositories/project.repository';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { InjectQueue } from '@nestjs/bull';
import { App } from 'modules/queue/enums/app.enum';
import { Queue } from 'bull';
import { AppEventEnum } from 'modules/queue/enums/app-event.enum';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { Queues } from 'modules/queue/enums/queues.enum';

@Injectable()
export class KeywordUpdatingService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly keywordRepository: KeywordRepository,
    private readonly dataForSeoService: DataForSeoService,
    private readonly keywordPositionsForDayRepository: KeywordPositionsForDayRepository,
    private readonly searchResultRepository: SearchResultRepository,
    private readonly competitorKeywordPositionRepository: CompetitorKeywordPositionRepository,
    private readonly cliLoggingService: CliLoggingService,
    @InjectQueue(App.Keywords)
    private readonly keywordQueue: Queue,
    @InjectQueue(Queues.Projects)
    private readonly projectsQueue: Queue,
  ) {}

  /**
   * This method processes and saves the results of a keyword update.
   *
   * @param {string} tag - The tag string containing projectId and keywordId.
   * @param {any} items - The search results to be processed.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  @Transactional()
  async savingResultsOfKeywordUpdate(tag: string, items: any): Promise<void> {
    try {
      const { projectId, keywordId } = parseTagString(tag);
      const project = await this.projectRepository.getProjectByIdWithRelations(
        projectId,
      );
      const keyword = await this.keywordRepository.getKeywordById(keywordId);
      const keywordPositions = [];
      const competitorsPositions = [];
      const searchResult = [];
      const updatedKeywordIds = [];
      let dataItem: any;
      switch (project.searchEngine.name) {
        case SearchEnginesEnum.Google:
          dataItem = await this.dataForSeoService.processSearchResult(
            items,
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
          break;

        case SearchEnginesEnum.Bing:
          dataItem = await this.dataForSeoService.processSearchResultForBing(
            items,
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
          break;
        case SearchEnginesEnum.Baidu:
          dataItem = await this.dataForSeoService.processSearchResultForBaidu(
            items,
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
          break;
        case SearchEnginesEnum.Yahoo:
          dataItem = await this.dataForSeoService.processSearchResultForYahoo(
            items,
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
          break;
        case SearchEnginesEnum.GoogleMyBusiness:
          dataItem =
            await this.dataForSeoService.processSearchResultForGoogleLocal(
              items,
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
          break;
        case SearchEnginesEnum.GoogleMaps:
          dataItem =
            await this.dataForSeoService.processSearchResultForGoogleMaps(
              items,
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
          break;
        case SearchEnginesEnum.YouTube:
          dataItem = await this.dataForSeoService.processSearchResultForYoutube(
            items,
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
          break;

        default:
          dataItem = [];
          break;
      }
      await this.searchResultRepository.save(searchResult);
      if (competitorsPositions.length > 0) {
        await this.competitorKeywordPositionRepository.save(
          competitorsPositions,
        );
      }
      await this.keywordRepository.uprateKeywords(updatedKeywordIds, false);
      await this.projectRepository.updateProjectsByProjectIds([project.id]);

      await this.keywordQueue.add(AppEventEnum.UpdateDataForKeywordRankings, {
        keywordId,
        projectId: project.id,
      });

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
    } catch (error) {
      this.cliLoggingService.error(
        'Error: savingResultsOfKeywordUpdate',
        error,
      );
    }
  }

  /**
   * Save the results of a ready task by updating keyword information in the repository.
   *
   * @param {TaskRequest} payload - The data payload containing the task result and associated metadata.
   * @return {Promise<void>} - A promise that resolves when the save operation is complete.
   */
  @Transactional()
  async saveResultsOfReadyTask(payload: TaskRequest): Promise<void> {
    if (payload.result && payload.result.length > 0) {
      const regex = /project_id_(\d+)/;
      const match = payload.data.tag.match(regex);
      if (match) {
        const projectId = Number(match[1]);
        const keywords = [];

        for (const keywordData of payload.result) {
          const keyword =
            await this.keywordRepository.getKeywordByNameAndProjectId(
              keywordData.keyword,
              projectId,
            );
          if (keyword) {
            keyword.cpc = keywordData.cpc ?? 0;
            keyword.searchVolume =
              keywordData.monthly_searches &&
              keywordData.monthly_searches.length > 0
                ? keywordData.monthly_searches[0].search_volume
                : 0;
            keyword.competitionIndex = keywordData.competition_index ?? 0;
            keywords.push(keyword);
          }
        }
        await this.keywordRepository.save(
          keywords.map((item) => {
            return {
              id: item.id,
              cpc: item.cpc,
              searchVolume: item.searchVolume,
              competitionIndex: item.competitionIndex,
            };
          }),
        );
      }
    }
  }
}
