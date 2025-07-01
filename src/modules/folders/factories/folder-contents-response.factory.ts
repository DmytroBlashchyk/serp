import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { ContentType } from 'modules/folders/types/content.type';
import { FolderContentsResponse } from 'modules/folders/responses/folder-contents.response';
import { ContentResponse } from 'modules/folders/responses/content.response';
import { Injectable } from '@nestjs/common';
import { ContentTypeEnum } from 'modules/folders/enums/content-type.enum';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { ProjectTagRepository } from 'modules/tags/repositories/project-tag.repository';
import moment from 'moment';
import { getStartDate } from 'modules/keywords/helpers/getStartDate';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { ProjectPerformanceCacheTransformer } from 'modules/cache/transformers/project-performance.cache-transformer';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';
import { SearchEngineResponse } from 'modules/search-engines/responses/search-engine.response';
import { GoogleDomainResponse } from 'modules/google-domains/responses/google-domain.response';

@Injectable()
export class FolderContentsResponseFactory extends BaseResponseFactory<
  ContentType[],
  FolderContentsResponse
> {
  constructor(
    private readonly projectTagRepository: ProjectTagRepository,
    private readonly projectPerformanceCacheTransformer: ProjectPerformanceCacheTransformer,
    private readonly folderRepository: FolderRepository,
  ) {
    super();
  }

  /**
   * Creates a response containing details of provided content entities.
   *
   * @param {ContentType[]} entity - An array of content entities to be processed.
   * @param {Record<string, unknown>} [options] - Optional configuration options.
   * @return {Promise<FolderContentsResponse>} A promise that resolves to a FolderContentsResponse object.
   */
  async createResponse(
    entity: ContentType[],
    options?: Record<string, unknown>,
  ): Promise<FolderContentsResponse> {
    return new FolderContentsResponse({
      items: await Promise.all(
        entity.map(async (item) => {
          const toDate = moment().add(1, 'd').format('YYYY-MM-DD');
          const fromDate = getStartDate(TemporalFiltersEnum.Month);
          let dailyAverage;
          let totalKeywords = 0;
          if (item.type === 1) {
            dailyAverage =
              options.dailyAverage === BooleanEnum.FALSE
                ? []
                : await this.projectPerformanceCacheTransformer.cache({
                    projectId: item.id,
                    fromDate,
                    toDate,
                    deviceType: DeviceTypesEnum.DesktopAndMobile,
                  });
          }

          if (item.type === 2) {
            const numberOfKeywordsInInternalFolders =
              await this.folderRepository.getNumberOfKeywordsInAllInternalFolders(
                item.id,
              );
            totalKeywords =
              item.keywords_count + numberOfKeywordsInInternalFolders;
          } else {
            totalKeywords = item.keywords_count;
          }
          return new ContentResponse({
            ...item,
            favicon:
              item.type === 2
                ? '-'
                : item.url
                ? getFaviconHelper(item.url)
                : null,
            type:
              item.type === 2
                ? ContentTypeEnum.folder
                : ContentTypeEnum.project,
            frequencyId: item.frequency_id,
            frequencyName: item.frequency_name,
            createdAt: dateHelper(item.created_at),
            createdAtFullFormat: formatGoogleStyleDate(item.created_at),
            totalKeywords,
            deviceTypeName: item.type === 2 ? '-' : item.project_device_type,
            createdBy: item.created_by,
            lastModified:
              item.type === 2 ? dateHelper(item.last_modified) : '-',
            lastModifiedFullFormat:
              item.type === 2 ? formatGoogleStyleDate(item.updated_at) : '-',
            updated: item.type === 1 ? dateHelper(item.updated_at) : '-',
            updatedFullFormat:
              item.type === 1 ? formatGoogleStyleDate(item.updated_at) : '-',
            improved: +item.improved,
            declined: +item.declined,
            noChange: +item.no_change,
            updateDate: item.update_date,
            previousUpdateDate: item.previous_update_date,
            searchEngine: new SearchEngineResponse({
              id: item.search_engines_id,
              name: item.search_engines_name,
            }),
            region: new GoogleDomainResponse({
              id: item.google_domains_id,
              name: item.google_domains_name,
              countryName: item.google_domains_country_name,
            }),
            dailyAverage,
            tags:
              item.type === 2
                ? []
                : await this.projectTagRepository.getProjectTagsByProjectId(
                    item.id,
                  ),
            isUpdated: item.number_of_keywords_that_are_updated > 0,
          });
        }),
      ),
      meta: options,
    });
  }
}
