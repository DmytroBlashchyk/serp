import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';
import { Injectable } from '@nestjs/common';
import { CompetitorPositionHistoryCacheType } from 'modules/cache/types/competitor-position-history-cache.type';
import { CompetitorKeywordPositionRepository } from 'modules/competitors/repositories/competitor-keyword-position.repository';

@Injectable()
export class CompetitorProjectPositionHistoryCacheTransformer extends BaseCacheTransformer {
  constructor(
    private readonly competitorKeywordPositionRepository: CompetitorKeywordPositionRepository,
  ) {
    super();
  }

  /**
   * Fetches the position history for a competitor based on the provided payload.
   *
   * @param {CompetitorPositionHistoryCacheType} payload - The data required to query the competitor's position history,
   * including keywordId, competitorId, toDate, and fromDate.
   * @return {Promise<{ date: string; position: number }[]>} A promise that resolves to an array of objects,
   * each containing a date and a position of the competitor for the given keyword.
   */
  async cache(
    payload: CompetitorPositionHistoryCacheType,
  ): Promise<{ date: string; position: number }[]> {
    return this.competitorKeywordPositionRepository.getPositionHistory(
      payload.keywordId,
      payload.competitorId,
      payload.toDate,
      payload.fromDate,
    );
  }
}
