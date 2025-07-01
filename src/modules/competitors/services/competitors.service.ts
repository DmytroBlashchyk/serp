import { Injectable } from '@nestjs/common';
import { CompetitorRepository } from 'modules/competitors/repositories/competitor.repository';
import { CompetitorEntity } from 'modules/competitors/entities/competitor.entity';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { CompetitorsProjectPerformanceResponse } from 'modules/competitors/responses/competitors-project-performance.response';
import { CompetitorProjectPerformanceResponse } from 'modules/competitors/responses/competitor-project-performance.response';
import { SearchResultRepository } from 'modules/keywords/repositories/search-result.repository';
import { CompetitorHistoryResponse } from 'modules/keywords/responses/competitor-history.response';
import { HistoryResponse } from 'modules/keywords/responses/history.response';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CompetitorProjectPerformanceCacheTransformer } from 'modules/cache/transformers/competitor-project-performance.cache-transformer';
import { CompetitorProjectPositionHistoryCacheTransformer } from 'modules/cache/transformers/competitor-project-position-history.cache-transformer';
import { CompetitorBusinessRequest } from 'modules/projects/requests/competitor-business.request';

@Injectable()
export class CompetitorsService {
  constructor(
    private readonly competitorRepository: CompetitorRepository,
    private readonly competitorKeywordPositionRepository: CompetitorKeywordPositionRepository,
    private readonly searchResultRepository: SearchResultRepository,
    private readonly competitorProjectPerformanceCacheTransformer: CompetitorProjectPerformanceCacheTransformer,
    private readonly competitorProjectPositionHistoryCacheTransformer: CompetitorProjectPositionHistoryCacheTransformer,
  ) {}

  /**
   * Retrieves the position history of competitors for a specified keyword over a given date range.
   *
   * @param {IdType} keywordId - The unique identifier of the keyword.
   * @param {string} toDate - The end date of the period for which the history is to be retrieved.
   * @param {string} fromDate - The start date of the period for which the history is to be retrieved.
   * @param {IdType[]} competitorIds - An array of unique identifiers for the competitors.
   * @return {Promise<CompetitorHistoryResponse[]>} A promise that resolves to an array of CompetitorHistoryResponse objects.
   */
  async getPositionHistory(
    keywordId: IdType,
    toDate: string,
    fromDate: string,
    competitorIds: IdType[],
  ): Promise<CompetitorHistoryResponse[]> {
    const competitors = await this.competitorRepository.getCompetitors(
      competitorIds,
    );
    const data = [];
    for (const competitor of competitors) {
      const items =
        await this.competitorProjectPositionHistoryCacheTransformer.cache({
          keywordId,
          competitorId: competitor.id,
          fromDate,
          toDate,
        });
      data.push(
        new CompetitorHistoryResponse({
          id: competitor.id,
          domainName: competitor.domainName,
          businessName: competitor.businessName,
          url: competitor.url,
          items: items.map(
            (item) =>
              new HistoryResponse({
                position: +item.position === 0 ? 101 : +item.position,
                date: item.date,
              }),
          ),
        }),
      );
    }

    return data;
  }

  /**
   * Deletes keyword positions for the given keyword IDs.
   *
   * @param {IdType[]} ids - The IDs of the keywords whose positions need to be deleted.
   * @return {Promise<void>} - A promise that resolves when the deletion operation is complete.
   */
  async deleteKeywordPositionsByKeywordIds(ids: IdType[]) {
    await this.competitorKeywordPositionRepository.deleteKeywordPositionsByKeywordIds(
      ids,
    );
  }

  /**
   * Retrieves performance metrics for specified competitors within a project over a given date range and device type.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {IdType[]} competitorIds - An array of unique identifiers for competitors.
   * @param {string} fromDate - The start date for the performance data in YYYY-MM-DD format.
   * @param {string} toDate - The end date for the performance data in YYYY-MM-DD format.
   * @param {DeviceTypesEnum} deviceType - The type of device for the performance data.
   * @return {Promise<CompetitorsProjectPerformanceResponse>} A promise that resolves to a performance response object containing the performance data of the specified competitors.
   */
  async getProjectPerformanceByCompetitorIds(
    projectId: IdType,
    competitorIds: IdType[],
    fromDate: string,
    toDate: string,
    deviceType: DeviceTypesEnum,
  ): Promise<CompetitorsProjectPerformanceResponse> {
    const data = [];
    const competitors =
      await this.competitorRepository.getCompetitorsByProjectIdAndAccountId(
        projectId,
      );
    for (const competitorId of competitorIds) {
      const competitor = competitors.find((item) => item.id == competitorId);
      data.push(
        new CompetitorProjectPerformanceResponse({
          id: competitor?.id,
          domainName: competitor?.domainName,
          businessName: competitor?.businessName,
          url: competitor?.url,
          items: await this.competitorProjectPerformanceCacheTransformer.cache({
            projectId,
            competitorId,
            fromDate,
            toDate,
            deviceType,
          }),
        }),
      );
    }
    return new CompetitorsProjectPerformanceResponse({
      items: data,
    });
  }

  /**
   * Determines the position of competitor keywords based on search results.
   *
   * @param {IdType} keywordId - The identifier for the keyword to be analyzed.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async determinePositionOfCompetitorsKeywords(
    keywordId: IdType,
  ): Promise<void> {
    const competitors =
      await this.competitorRepository.getCompetitorsByKeywordId(keywordId);
    const searches =
      await this.searchResultRepository.getLastSearchResultByKeywordId(
        keywordId,
      );
    const competitorsKeywordPosition = [];
    for (const competitor of competitors) {
      const result = searches.result.find(
        (search: { link: string; position: number }) =>
          search.link.includes(competitor.domainName),
      ) as { position: number };
      competitorsKeywordPosition.push({
        competitor,
        position: result?.position ?? 0,
        keyword: { id: keywordId },
      });
    }
    await this.competitorKeywordPositionRepository.save([
      ...competitorsKeywordPosition,
    ]);
  }

  /**
   * Deletes the provided competitors and their associated keyword positions from the database.
   *
   * @param {CompetitorEntity[]} competitors - An array of CompetitorEntity objects that need to be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion process is complete.
   */
  async deleteCompetitors(competitors: CompetitorEntity[]): Promise<void> {
    await this.competitorKeywordPositionRepository.deleteKeywordPositionsByCompetitorIds(
      competitors.map((competitor) => competitor.id),
    );
    await this.competitorRepository.deleteCompetitorsByIds(
      competitors.map((competitor) => competitor.id),
    );
  }

  /**
   * Creates new business competitors in the system.
   *
   * @param {CompetitorBusinessRequest[]} competitors - An array of objects representing the competitors to be created. Each object should contain `competitorBusinessName` and `competitorUrl` properties.
   * @return {Promise<CompetitorEntity[]>} A promise that resolves to an array of CompetitorEntity objects representing the newly created competitors.
   */
  async createBusinessCompetitors(
    competitors: CompetitorBusinessRequest[],
  ): Promise<CompetitorEntity[]> {
    const newCompetitors: CompetitorEntity[] = [];
    for (const competitor of competitors) {
      newCompetitors.push(
        await this.competitorRepository.create({
          businessName: competitor.competitorBusinessName,
          url: competitor.competitorUrl,
        }),
      );
    }
    return this.competitorRepository.save(newCompetitors);
  }

  /**
   * Creates competitors from a list of domain names.
   *
   * @param {string[]} competitors - An array of domain names for which competitors are to be created.
   * @return {Promise<CompetitorEntity[]>} - A promise that resolves to an array of newly created competitor entities.
   */
  async createCompetitors(competitors: string[]): Promise<CompetitorEntity[]> {
    const newCompetitors: CompetitorEntity[] = [];
    for (const competitor of competitors) {
      newCompetitors.push(
        await this.competitorRepository.create({ domainName: competitor }),
      );
    }
    return this.competitorRepository.save(newCompetitors);
  }

  /**
   * Retrieves a list of competitors associated with a given project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<CompetitorEntity[]>} A promise that resolves to an array of CompetitorEntity objects.
   */
  async getProjectCompetitors(projectId: IdType): Promise<CompetitorEntity[]> {
    return this.competitorRepository.getCompetitorsByProjectIdAndAccountId(
      projectId,
    );
  }
}
