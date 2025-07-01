import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';
import { GetProjectPerformanceType } from 'modules/keywords/types/get-project-performance.type';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';
import { CompetitorProjectPerformanceType } from 'modules/cache/types/competitor-project-performance.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CompetitorProjectPerformanceCacheTransformer extends BaseCacheTransformer {
  constructor(
    private readonly competitorKeywordPositionRepository: CompetitorKeywordPositionRepository,
  ) {
    super();
  }
  /**
   * Retrieves and caches the performance data for a competitor's project.
   *
   * @param {CompetitorProjectPerformanceType} payload - The data required to fetch the performance, including project ID, competitor ID, date range, and device type.
   * @return {Promise<GetProjectPerformanceType[]>} A promise that resolves to an array of project performance data.
   */
  async cache(
    payload: CompetitorProjectPerformanceType,
  ): Promise<GetProjectPerformanceType[]> {
    return this.competitorKeywordPositionRepository.getProjectPerformance(
      payload.projectId,
      payload.competitorId,
      payload.fromDate,
      payload.toDate,
      payload.deviceType,
    );
  }
}
