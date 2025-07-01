import { KeywordTrendsCacheType } from 'modules/cache/types/keyword-trends-cache.type';
import { Injectable } from '@nestjs/common';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { KeywordTrendType } from 'modules/projects/types/keyword-trend.type';
import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';

@Injectable()
export class KeywordTrendsCacheTransformer extends BaseCacheTransformer {
  constructor(private readonly keywordRepository: KeywordRepository) {
    super();
  }
  /**
   * Caches keyword trends based on the provided payload.
   *
   * @param {KeywordTrendsCacheType} payload - The data required to cache keyword trends, including project ID, date range, and device type.
   * @return {Promise<KeywordTrendType[]>} A promise that resolves to an array of keyword trend data.
   */
  async cache(payload: KeywordTrendsCacheType): Promise<KeywordTrendType[]> {
    return this.keywordRepository.getKeywordTrends({
      projectId: payload.projectId,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      deviceType: payload.deviceType,
    });
  }
}
