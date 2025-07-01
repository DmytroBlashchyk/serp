import { Injectable } from '@nestjs/common';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { ImprovedVsDeclinedCacheType } from 'modules/cache/types/improved-vs-declined-cache.type';
import { GetStatisticsType } from 'modules/projects/types/get-statistics.type';
import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';

@Injectable()
export class ImprovedVsDeclinedCacheTransformer extends BaseCacheTransformer {
  constructor(private readonly keywordRepository: KeywordRepository) {
    super();
  }

  /**
   * Retrieves and caches statistics based on the provided payload.
   *
   * @param {ImprovedVsDeclinedCacheType} payload - The payload containing the parameters for the cache query.
   * @param {string} payload.projectId - The ID of the project to retrieve the statistics for.
   * @param {string} payload.fromDate - The start date for the statistics query.
   * @param {string} payload.toDate - The end date for the statistics query.
   * @param {string} payload.deviceType - The device type for which the statistics are queried.
   * @return {Promise<GetStatisticsType[]>} A promise that resolves to an array of statistics.
   */
  async cache(
    payload: ImprovedVsDeclinedCacheType,
  ): Promise<GetStatisticsType[]> {
    return this.keywordRepository.improvedVsDeclinedForDays({
      projectId: payload.projectId,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      deviceType: payload.deviceType,
    });
  }
}
