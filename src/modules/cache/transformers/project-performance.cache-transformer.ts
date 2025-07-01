import { BaseCacheTransformer } from 'modules/cache/transformers/base.cache-transformer';
import { KeywordRepository } from 'modules/keywords/repositories/keyword.repository';
import { Injectable } from '@nestjs/common';
import { ProjectPerformanceCacheType } from 'modules/cache/types/project-performance-cache.type';
import { GetProjectPerformanceType } from 'modules/keywords/types/get-project-performance.type';

@Injectable()
export class ProjectPerformanceCacheTransformer extends BaseCacheTransformer {
  constructor(private readonly keywordRepository: KeywordRepository) {
    super();
  }
  /**
   * Caches the project performance data based on the given payload.
   *
   * @param {ProjectPerformanceCacheType} payload - An object containing the project performance parameters.
   * @param {string} payload.projectId - The ID of the project.
   * @param {Date} payload.fromDate - The start date of the performance period.
   * @param {Date} payload.toDate - The end date of the performance period.
   * @param {string} payload.deviceType - The type of device for which the performance data is cached.
   * @return {Promise<GetProjectPerformanceType[]>} - The project performance data for the specified parameters.
   */
  async cache(
    payload: ProjectPerformanceCacheType,
  ): Promise<GetProjectPerformanceType[]> {
    return this.keywordRepository.getProjectPerformance(
      payload.projectId,
      payload.fromDate,
      payload.toDate,
      payload.deviceType,
    );
  }
}
