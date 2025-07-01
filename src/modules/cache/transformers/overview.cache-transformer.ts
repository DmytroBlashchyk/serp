import { Injectable } from '@nestjs/common';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { OverviewCacheType } from 'modules/cache/types/overview-cache.type';
import { OverviewType } from 'modules/keywords/types/overview.type';
import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';

@Injectable()
export class OverviewCacheTransformer extends BaseCacheTransformer {
  constructor(private readonly keywordRepository: KeywordRepository) {
    super();
  }
  /**
   * Retrieves cached overview data for a given account, date range, device type, and project.
   *
   * @param {OverviewCacheType} payload - The data required to fetch the overview. Contains accountId, fromDate, toDate, deviceType, and projectId.
   * @return {Promise<OverviewType>} A promise that resolves to the overview data.
   */
  async cache(payload: OverviewCacheType): Promise<OverviewType> {
    return this.keywordRepository.getOverview({
      accountId: payload.accountId,
      fromDate: payload.fromDate,
      toDate: payload.toDate,
      deviceType: payload.deviceType,
      projectId: payload.projectId,
    });
  }
}
