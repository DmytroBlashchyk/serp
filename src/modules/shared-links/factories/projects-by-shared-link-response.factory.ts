import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ProjectsBySharedLinkResponse } from 'modules/shared-links/responses/projects-by-shared-link.response';
import { ProjectByLinkType } from 'modules/shared-links/types/project-by-link.type';
import { Injectable } from '@nestjs/common';
import { ProjectBySharedLinkResponse } from 'modules/shared-links/responses/project-by-shared-link.response';
import { DeviceTypesRepository } from 'modules/device-types/repositories/device-types.repository';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import moment from 'moment';
import { getStartDate } from 'modules/keywords/helpers/getStartDate';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';

@Injectable()
export class ProjectsBySharedLinkResponseFactory extends BaseResponseFactory<
  ProjectByLinkType[],
  ProjectsBySharedLinkResponse
> {
  constructor(
    private readonly desktopTypesRepository: DeviceTypesRepository,
    private readonly projectPerformanceCacheTransformer: ProjectPerformanceCacheTransformer,
  ) {
    super();
  }
  /**
   * Creates a response object containing project details based on the provided entities and options.
   *
   * @param {ProjectByLinkType[]} entity - The array of project link entities to process.
   * @param {Record<string, unknown>} [options] - Additional options to customize the response.
   * @return {Promise<ProjectsBySharedLinkResponse>} - A promise that resolves to a ProjectsBySharedLinkResponse object.
   */
  async createResponse(
    entity: ProjectByLinkType[],
    options?: Record<string, unknown>,
  ): Promise<ProjectsBySharedLinkResponse> {
    const deviceTypes = await this.desktopTypesRepository.find();
    let type = deviceTypes.find(
      (type) => type.name === DeviceTypesEnum.DesktopAndMobile,
    );
    const toDate = moment().add(1, 'd').format('YYYY-MM-DD');
    const fromDate = getStartDate(TemporalFiltersEnum.Month);
    return new ProjectsBySharedLinkResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          type = deviceTypes.find(
            (type) => type.name === item.project_device_type,
          );

          return new ProjectBySharedLinkResponse({
            id: item.id,
            projectName:
              options.projectName === BooleanEnum.TRUE
                ? item.project_name
                : undefined,
            url: options.url === BooleanEnum.TRUE ? item.url : undefined,
            favicon:
              options.projectName === BooleanEnum.TRUE
                ? item.url
                  ? getFaviconHelper(item.url)
                  : null
                : undefined,
            deviceType: type,
            totalKeywords:
              options.totalKeywords === BooleanEnum.TRUE
                ? +item.total_keywords
                : undefined,
            improved:
              options.improved === BooleanEnum.TRUE ? item.improved : undefined,
            declined:
              options.declined === BooleanEnum.TRUE ? item.declined : undefined,
            noChange:
              options.noChange === BooleanEnum.TRUE
                ? item.no_change
                : undefined,
            dailyAverage:
              options.dailyAverage === BooleanEnum.FALSE
                ? []
                : await this.projectPerformanceCacheTransformer.cache({
                    projectId: item.id,
                    fromDate,
                    toDate,
                    deviceType: DeviceTypesEnum.DesktopAndMobile,
                  }),
            frequency:
              options.frequency === BooleanEnum.TRUE
                ? new CheckFrequencyResponse({
                    id: item.frequency_id,
                    name: item.frequency_name,
                  })
                : undefined,
            createdAt:
              options.created === BooleanEnum.TRUE
                ? dateHelper(item.created_at)
                : undefined,
            createdAtFullFormat:
              options.created === BooleanEnum.TRUE
                ? formatGoogleStyleDate(item.created_at)
                : undefined,
            updatedAt:
              options.updated === BooleanEnum.TRUE
                ? dateHelper(item.updated_at)
                : undefined,
            updatedAtFullFormat:
              options.updated === BooleanEnum.TRUE
                ? formatGoogleStyleDate(item.updated_at)
                : undefined,
            region: new GoogleDomainResponse({
              id: item.region_id,
              name: item.region_name,
              countryName: item.region_country_name,
            }),
            searchEngine: new SearchEngineResponse({
              id: item.search_engines_id,
              name: item.search_engines_name,
            }),
            isUpdated: item.number_of_keywords_that_are_updated > 0,
          });
        }),
      ),
      meta: options.meta,
    });
  }
}
