import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiService } from 'modules/api/services/api.service';
import { ApiAuth } from 'modules/api/decorators/api-auth.decorator';
import { ApiToken } from 'modules/api/decorators/api-token.decorator';
import { SerpnestApiKeyData } from 'modules/api/types/serpnest-api-key-data.type';
import { ApiProjectsRequest } from 'modules/api/requests/api-projects.request';
import { ApiProjectsResponse } from 'modules/api/response/api-projects.response';
import { IdType } from 'modules/common/types/id-type.type';
import { ApiProjectResponse } from 'modules/api/response/api-project.response';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { ApiProjectKeywordsRequest } from 'modules/api/requests/api-project-keywords.request';
import { ApiUpdateKeywordPositionsRequest } from 'modules/api/requests/api-update-keyword-positions.request';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { ApiAccountInfoResponse } from 'modules/api/response/api-account-info.response';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';

@ApiTags('API Version 1')
@Controller('api/v1')
export class ApiV1Controller {
  constructor(private readonly apiService: ApiService) {}

  /**
   * Retrieves a list of projects based on the provided token data and query parameters.
   *
   * @param {SerpnestApiKeyData} tokenData - The token data containing account information.
   * @param {ApiProjectsRequest} query - The query parameters for filtering the project list.
   * @return {Promise<ApiProjectsResponse>} A promise that resolves to the response containing the list of projects.
   */
  @ApiOkResponse({ type: ApiProjectsResponse })
  @Get('projects')
  @ApiAuth()
  getProjects(
    @ApiToken() tokenData: SerpnestApiKeyData,
    @Query() query: ApiProjectsRequest,
  ): Promise<ApiProjectsResponse> {
    return this.apiService.getProjects(tokenData.account.accountId, {
      ...query,
    });
  }

  /**
   * Retrieves information about a specific project.
   *
   * @param {SerpnestApiKeyData} tokenData - The token data containing the API key and account information.
   * @param {IdType} projectId - The unique identifier of the project to retrieve.
   * @return {Promise<ApiProjectResponse>} A promise that resolves to the project information.
   */
  @ApiOkResponse({ type: ApiProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Get('projects/:projectId')
  @ApiAuth()
  getProjectInfo(
    @ApiToken() tokenData: SerpnestApiKeyData,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
  ): Promise<ApiProjectResponse> {
    return this.apiService.getProject(tokenData.account.accountId, projectId);
  }

  /**
   * Retrieves account information based on the provided token data.
   *
   * @param {SerpnestApiKeyData} tokenData - The token data containing account information.
   * @return {Promise<ApiAccountInfoResponse>} A promise that resolves to account information.
   */
  @Get('account-info')
  @ApiAuth()
  @ApiOkResponse({ type: ApiAccountInfoResponse })
  getAccountInfo(
    @ApiToken() tokenData: SerpnestApiKeyData,
  ): Promise<ApiAccountInfoResponse> {
    return this.apiService.getAccountInfo(tokenData.account.accountId);
  }

  /**
   * Retrieves keyword trends for a specific project.
   *
   * @param {SerpnestApiKeyData} tokenData - Authentication token data including account information.
   * @param {IdType} id - The unique identifier of the project.
   * @return {Promise<KeywordTrendsResponse>} A promise that resolves to the keyword trends response.
   */
  @Get('projects/:id/keyword-trends')
  @ApiAuth()
  getKeywordTrends(
    @ApiToken() tokenData: SerpnestApiKeyData,
    @Param('id') id: IdType,
  ): Promise<KeywordTrendsResponse> {
    return this.apiService.getKeywordTrends(tokenData.account.accountId, id);
  }

  /**
   * Retrieves the keywords associated with a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @param {ApiProjectKeywordsRequest} query - The query parameters for filtering the keywords.
   * @param {SerpnestApiKeyData} tokenData - The token data containing account information.
   * @return {Promise<KeywordRankingsResponse>} A promise resolving to the keyword rankings response.
   */
  @Get('projects/:projectId/keywords')
  @ApiAuth()
  getProjectKeywords(
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: ApiProjectKeywordsRequest,
    @ApiToken() tokenData: SerpnestApiKeyData,
  ): Promise<KeywordRankingsResponse> {
    return this.apiService.getProjectKeywords(
      projectId,
      tokenData.account.accountId,
      { ...query },
    );
  }

  /**
   * Updates the positions of the specified keywords for a given account.
   *
   * @param {SerpnestApiKeyData} tokenData - The API token data containing the account information.
   * @param {ApiUpdateKeywordPositionsRequest} body - The request body containing the IDs of the keywords whose positions need to be updated.
   * @return {Promise<void>} A promise that resolves when the keyword positions have been successfully updated.
   */
  @Post('update-keyword-positions')
  updateKeywordPositions(
    @ApiToken() tokenData: SerpnestApiKeyData,
    @Body() body: ApiUpdateKeywordPositionsRequest,
  ): Promise<void> {
    return this.apiService.updateKeywordPositions(
      tokenData.account.accountId,
      body.keywordIds,
    );
  }
}
