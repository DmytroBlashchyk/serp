import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { SerpnestApiKeyData } from 'modules/api/types/serpnest-api-key-data.type';
import { JwtService } from '@nestjs/jwt';
import { ApiProjectsRequest } from 'modules/api/requests/api-projects.request';
import { ApiProjectsFactory } from 'modules/api/factories/api-projects.factory';
import { ApiProjectsResponse } from 'modules/api/response/api-projects.response';
import { ApiProjectResponse } from 'modules/api/response/api-project.response';
import { NoteResponse } from 'modules/notes/responses/note.response';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { ApiProjectKeywordsRequest } from 'modules/api/requests/api-project-keywords.request';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { SortOrderEnum } from 'modules/common/enums/sort-order.enum';
import { TemporalFiltersEnum } from 'modules/projects/enums/temporal-filters.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { KeywordTrendsResponseFactory } from 'modules/projects/factories/keyword-trends-response.factory';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { ApiAccountInfoResponse } from 'modules/api/response/api-account-info.response';
import { ApiAccountInfoResponseFactory } from 'modules/api/factories/api- account-info-response.factory';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { getFaviconHelper } from 'modules/projects/helpers/getFaviconHelper';

@Injectable()
export class ApiService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly projectsService: ProjectsService,
    private readonly apiProjectsFactory: ApiProjectsFactory,
    private readonly keywordsService: KeywordsService,
    private readonly keywordTrendsResponseFactory: KeywordTrendsResponseFactory,
    private readonly accountsService: AccountsService,
    private readonly apiAccountInfoResponseFactory: ApiAccountInfoResponseFactory,
  ) {}

  /**
   * Fetches account information for a given account ID.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<ApiAccountInfoResponse>} - A promise that resolves to the account information response.
   */
  async getAccountInfo(accountId: IdType): Promise<ApiAccountInfoResponse> {
    const account = await this.accountsService.getAccountInfo(accountId);

    return this.apiAccountInfoResponseFactory.createResponse(account);
  }

  /**
   * Fetches keyword trends for a specified account and project.
   *
   * @param {IdType} accountId - The ID of the account to fetch keyword trends for.
   * @param {IdType} projectId - The ID of the project to fetch keyword trends for.
   *
   * @return {Promise<KeywordTrendsResponse>} - A promise that resolves to a response containing keyword trends data.
   */
  async getKeywordTrends(
    accountId: IdType,
    projectId: IdType,
  ): Promise<KeywordTrendsResponse> {
    const keyword = await this.keywordsService.getKeywordTrends({
      accountId,
      projectId,
      period: TemporalFiltersEnum.All,
      deviceType: DeviceTypesEnum.DesktopAndMobile,
    });
    return this.keywordTrendsResponseFactory.createResponse(keyword, {
      top3Filter: BooleanEnum.TRUE,
      fromFourToTen: BooleanEnum.TRUE,
      fromTwentyOneToFifty: BooleanEnum.TRUE,
      fiftyOneToOneHundred: BooleanEnum.TRUE,
      fromElevenToTwenty: BooleanEnum.TRUE,
      notRanked: BooleanEnum.TRUE,
    });
  }

  /**
   * Updates the positions of the specified keywords for a given account.
   *
   * @param {IdType} accountId - The ID of the account to which the keywords belong.
   * @param {IdType[]} keywordIds - An array of keyword IDs whose positions need to be updated.
   * @return {Promise<void>} A promise that resolves when the keyword positions have been successfully updated.
   */
  async updateKeywordPositions(
    accountId: IdType,
    keywordIds: IdType[],
  ): Promise<void> {
    await this.keywordsService.updateKeywordPositionsByKeywordIds(
      accountId,
      keywordIds,
    );
  }

  /**
   * Retrieves the keyword rankings for a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {ApiProjectKeywordsRequest} options - The request options for fetching keyword rankings.
   * @returns {Promise<KeywordRankingsResponse>} A promise resolving to the keyword rankings response.
   */
  async getProjectKeywords(
    projectId: IdType,
    accountId: IdType,
    options: ApiProjectKeywordsRequest,
  ): Promise<KeywordRankingsResponse> {
    return this.keywordsService.getKeywordRankings(
      {
        projectId,
        accountId,
      },
      {
        ...options,
        best: BooleanEnum.TRUE,
        declined: BooleanEnum.TRUE,
        lost: BooleanEnum.TRUE,
        improved: BooleanEnum.TRUE,
        notRanked: BooleanEnum.TRUE,
        top3: BooleanEnum.TRUE,
        top10: BooleanEnum.TRUE,
        top30: BooleanEnum.TRUE,
        top100: BooleanEnum.TRUE,
        noChange: BooleanEnum.TRUE,
        sortBy: undefined,
        sortOrder: SortOrderEnum.asc,
        deviceType: DeviceTypesEnum.DesktopAndMobile,
      },
    );
  }

  /**
   * Fetches the project details for the given account and project identifiers.
   *
   * @param {IdType} accountId - The identifier of the account to which the project belongs.
   * @param {IdType} projectId - The identifier of the project to be fetched.
   * @return {Promise<ApiProjectResponse>} A promise that resolves to the project details in the form of an ApiProjectResponse object.
   */
  async getProject(
    accountId: IdType,
    projectId: IdType,
  ): Promise<ApiProjectResponse> {
    const project = await this.projectsService.getProjectForApi(
      accountId,
      projectId,
    );
    return new ApiProjectResponse({
      ...project,
      name: project.projectName,
      favicon: project.url ? getFaviconHelper(project.url) : null,
      domain: project.url,
      frequency: project.checkFrequency,
      location: project.location.locationName,
      notes: project.notes.map(
        (note) =>
          new NoteResponse({
            ...note,
            date: note.createdAt,
            author: note.author.username,
          }),
      ),
    });
  }

  /**
   * Retrieves the list of projects associated with the given account ID.
   *
   * @param {IdType} accountId - The unique identifier of the account to retrieve projects for.
   * @param {ApiProjectsRequest} options - An object containing filtering and pagination options for the request.
   *
   * @return {Promise<ApiProjectsResponse>} A promise that resolves with the list of projects and related meta information.
   */
  async getProjects(
    accountId: IdType,
    options: ApiProjectsRequest,
  ): Promise<ApiProjectsResponse> {
    const { items, meta } = await this.projectsService.gerProjectsByAccountId(
      accountId,
      options,
    );
    return this.apiProjectsFactory.createResponse(items, meta);
  }

  /**
   * Verifies the provided API key using JWT service.
   *
   * @param {string} apiKey - The API key to be verified.
   * @returns {Promise<undefined | SerpnestApiKeyData>} - Returns the decoded JWT data if verification is successful, otherwise returns undefined.
   */
  async verifyApiKey(apiKey: string): Promise<undefined | SerpnestApiKeyData> {
    try {
      return this.jwtService.verifyAsync(apiKey);
    } catch (error) {
      return;
    }
  }
}
