import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { AccountSearchResponse } from 'modules/accounts/responses/account-search.response';
import { AccountSearchType } from 'modules/accounts/types/account-search.type';
import { Injectable } from '@nestjs/common';
import { SearchTypeEnum } from 'modules/accounts/enums/search-type.enum';
import { ProjectSearchResponse } from 'modules/accounts/responses/project-search.response';
import { FolderSearchResponse } from 'modules/accounts/responses/folder-search.response';
import { KeywordSearchResponse } from 'modules/accounts/responses/keyword-search.response';
import { ProjectTagSearchResponse } from 'modules/accounts/responses/project-tag-search.response';
import { KeywordTagSearchResponse } from 'modules/accounts/responses/keyword-tag-search.response';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { RecentlyViewedSearchResponse } from 'modules/accounts/responses/recently-viewed-search.response';
import { SearchResultsType } from 'modules/users/types/search-results.type';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class AccountSearchResponseFactory extends BaseResponseFactory<
  Array<AccountSearchType>,
  AccountSearchResponse
> {
  /**
   * Creates a response object containing various search results including projects, keywords, folders,
   * project tags, and recently viewed items based on the provided entity data and optional filtering options.
   *
   * @param {Array<AccountSearchType>} entity - Array of account search types which can include projects, keywords, folders, project tags, and keyword tags.
   * @param {Record<string, unknown>} [options] - Optional filtering options to include specific types of search results in the response.
   * @param {boolean} [options.projects] - A boolean flag to include or exclude projects in the response.
   * @param {boolean} [options.keywords] - A boolean flag to include or exclude keywords in the response.
   * @param {boolean} [options.folders] - A boolean flag to include or exclude folders in the response.
   * @param {boolean} [options.tags] - A boolean flag to include or exclude project and keyword tags in the response.
   * @param {SearchResultsType[]} [options.recentlyViewed] - Array of recently viewed search results to be included in the response.
   * @return {Promise<AccountSearchResponse>} A promise that resolves to an AccountSearchResponse containing the filtered search results.
   */
  async createResponse(
    entity: Array<AccountSearchType>,
    options?: Record<string, unknown>,
  ): Promise<AccountSearchResponse> {
    const projects = [];
    const keywords = [];
    const folders = [];
    const projectTags = [];
    const projectKeywordTags = [];
    const recentlyViewed = options.recentlyViewed as SearchResultsType[];
    for (const item of entity) {
      if (item.type === SearchTypeEnum.projects) {
        const favicon = item.domain ? getFaviconHelper(item.domain) : null;
        projects.push(
          new ProjectSearchResponse({
            id: item.id,
            name: item.name,
            domain: item.domain,
            favicon,
          }),
        );
      }
      if (item.type === SearchTypeEnum.folders) {
        folders.push(
          new FolderSearchResponse({
            id: item.id,
            name: item.name,
          }),
        );
      }
      if (item.type == SearchTypeEnum.keywords) {
        keywords.push(
          new KeywordSearchResponse({
            id: item.id,
            name: item.keyword_name,
            domain: item.domain,
            projectId: item.project_id,
          }),
        );
      }
      if (item.type === SearchTypeEnum.project_tags) {
        projectTags.push(
          new ProjectTagSearchResponse({ id: item.id, name: item.name }),
        );
      }
      if (item.type === SearchTypeEnum.keyword_tags) {
        projectKeywordTags.push(
          new KeywordTagSearchResponse({
            id: item.id,
            name: item.name,
            domain: item.domain,
          }),
        );
      }
    }
    return new AccountSearchResponse({
      recentlyViewed: await Promise.all(
        recentlyViewed.map(
          async (item) =>
            new RecentlyViewedSearchResponse({
              id: item.project_id,
              name: item.project_name,
              domain: item.url,
              favicon: item.url ? getFaviconHelper(item.url) : null,
            }),
        ),
      ),
      projects: options.projects === BooleanEnum.TRUE ? projects : undefined,
      keywords: options.keywords === BooleanEnum.TRUE ? keywords : undefined,
      folders: options.folders === BooleanEnum.TRUE ? folders : undefined,
      projectTags: options.tags === BooleanEnum.TRUE ? projectTags : undefined,
      projectKeywordTags:
        options.tags === BooleanEnum.TRUE ? projectKeywordTags : undefined,
    });
  }
}
