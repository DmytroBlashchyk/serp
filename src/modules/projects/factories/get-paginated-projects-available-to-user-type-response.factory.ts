import { Injectable } from '@nestjs/common';
import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { PaginatedProjectAvailableToUserResponse } from 'modules/projects/responses/paginated-project-available-to-user.response';
import { ProjectAvailableToUserResponse } from 'modules/projects/responses/project-available-to-user.response';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { DeviceTypesService } from 'modules/device-types/services/device-types.service';
import { ProjectAvailableToUserType } from 'modules/projects/types/project-available-to-user.type';
import { DeviceTypeResponse } from 'modules/device-types/responses/device-type.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';
import { CheckFrequencyResponse } from 'modules/check-frequency/responses/check-frequency.response';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { getStartDate } from 'modules/keywords/helpers/getStartDate';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';

@Injectable()
export class GetPaginatedProjectsAvailableToUserTypeResponseFactory extends BaseResponseFactory<
  Array<ProjectAvailableToUserType>,
  PaginatedProjectAvailableToUserResponse
> {
  constructor(
    private readonly deviceTypesService: DeviceTypesService,
    private readonly projectPerformanceCacheTransformer: ProjectPerformanceCacheTransformer,
  ) {
    super();
  }
  /**
   * Creates a paginated response containing projects accessible to a user, including detailed information
   * about each project and its associated data.
   *
   * @param {Array<ProjectAvailableToUserType>} entity - The array of projects that the user has access to.
   * @param {Record<string, unknown>} [options] - Optional settings that can modify the behavior of the response creation.
   * @return {Promise<PaginatedProjectAvailableToUserResponse>} A promise that resolves to an object containing paginated project details.
   */
  async createResponse(
    entity: Array<ProjectAvailableToUserType>,
    options?: Record<string, unknown>,
  ): Promise<PaginatedProjectAvailableToUserResponse> {
    const desktopAndMobileDeviceType =
      await this.deviceTypesService.getDeviceType(
        DeviceTypesEnum.DesktopAndMobile,
      );

    const mobileDeviceType = await this.deviceTypesService.getDeviceType(
      DeviceTypesEnum.Mobile,
    );
    const desktopDeviceType = await this.deviceTypesService.getDeviceType(
      DeviceTypesEnum.Desktop,
    );
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const toDate = date.toISOString().split('T')[0].toString();
    const fromDate = getStartDate(TemporalFiltersEnum.Month);
    return new PaginatedProjectAvailableToUserResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          let deviceType = desktopAndMobileDeviceType;
          if (item.project_device_type === DeviceTypesEnum.Desktop) {
            deviceType = desktopDeviceType;
          } else if (item.project_device_type === DeviceTypesEnum.Mobile) {
            deviceType = mobileDeviceType;
          }
          return new ProjectAvailableToUserResponse({
            id: item.id,
            accountId: item.account_id,
            projectName: item.project_name,
            deviceType: new DeviceTypeResponse({ ...deviceType }),
            region: new GoogleDomainResponse({
              id: item.region_id,
              name: item.region_name,
              countryName: item.region_country_name,
            }),
            url: item.url,
            favicon: item.url ? getFaviconHelper(item.url) : null,
            improved: item.improved ?? 0,
            declined: item.declined ?? 0,
            noChange: item.no_change ?? 0,
            totalKeywords: item.count,
            dailyAverage:
              options.dailyAverage === BooleanEnum.FALSE
                ? []
                : await this.projectPerformanceCacheTransformer.cache({
                    projectId: item.id,
                    fromDate,
                    toDate,
                    deviceType: DeviceTypesEnum.DesktopAndMobile,
                  }),
            frequency: new CheckFrequencyResponse({
              id: item.frequency_id,
              name: item.frequency_name,
            }),
            createdAt: dateHelper(item.created_at),
            createdAtFullFormat: formatGoogleStyleDate(item.created_at),
            updatedAt: item.updated_at ? dateHelper(item.updated_at) : null,
            updatedAtFullFormat: item.updated_at
              ? formatGoogleStyleDate(item.updated_at)
              : null,
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
