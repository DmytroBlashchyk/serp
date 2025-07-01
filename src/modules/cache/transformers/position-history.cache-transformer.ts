import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';
import { Injectable } from '@nestjs/common';
import { PositionHistoryCacheType } from 'modules/cache/types/position-history-cache.type';
import { KeywordPositionsForDayRepository } from 'modules/keywords/repositories/keyword-positions-for-day.repository';
import { KeywordPositionsForDayEntity } from 'modules/keywords/entities/keyword-positions-for-day.entity';

@Injectable()
export class PositionHistoryCacheTransformer extends BaseCacheTransformer {
  constructor(
    private readonly keywordPositionsForDayRepository: KeywordPositionsForDayRepository,
  ) {
    super();
  }

  /**
   * Retrieves the position history of a given keyword within a specified date range.
   *
   * @param {PositionHistoryCacheType} payload - The payload containing the keyword ID and date range.
   * @param {string} payload.keywordId - The ID of the keyword.
   * @param {Date} payload.fromDate - The start date of the date range.
   * @param {Date} payload.toDate - The end date of the date range.
   *
   * @return {Promise<KeywordPositionsForDayEntity[]>} - A promise that resolves to an array of keyword position entities for the specified date range.
   */
  async cache(
    payload: PositionHistoryCacheType,
  ): Promise<KeywordPositionsForDayEntity[]> {
    return this.keywordPositionsForDayRepository.getPositionHistory(
      payload.keywordId,
      payload.fromDate,
      payload.toDate,
    );
  }
}
