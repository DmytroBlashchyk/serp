import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetSharedRequest } from 'modules/shared-links/requests/get-shared.request';
import { SharedLinksService } from 'modules/shared-links/services/shared-links.service';
import { ProjectsBySharedLinkResponse } from 'modules/shared-links/responses/projects-by-shared-link.response';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { SharedUserAuth } from 'modules/shared-links/decorators/shared-user-auth.decorator';
import { SharedLoginRequest } from 'modules/shared-links/requests/shared-login.request';
import { SharedAccessTokenResponse } from 'modules/shared-links/responses/shared-access-token.response';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestSharedTokenData } from 'modules/common/types/serpnest-shared-token-data.type';
import { IdType } from 'modules/common/types/id-type.type';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { GetProjectRequest } from 'modules/projects/requests/get-project.request';
import { OverviewRequest } from 'modules/projects/requests/overview.request';
import { ProjectOverviewResponse } from 'modules/projects/responses/project-overview.response';
import { ImprovedVsDeclinedRequest } from 'modules/projects/requests/improved-vs-declined.request';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { KeywordTrendsRequest } from 'modules/projects/requests/keyword-trends.request';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { PositionHistoryRequest } from 'modules/keywords/requests/position-history.request';
import { PositionHistoryResponse } from 'modules/keywords/responses/position-history.response';
import { ProjectPerformanceResponse } from 'modules/keywords/responses/project-performance.response';
import { SearchResultsRequest } from 'modules/keywords/requests/search-results.request';
import { SearchResultsResponse } from 'modules/keywords/responses/search-results.response';
import { KeywordRankingsBySharedLinkRequest } from 'modules/shared-links/requests/keyword-rankings-by-shared-link.request';
import { ProjectPerformanceRequest } from 'modules/projects/requests/project-performance.request';
import { SharedLinkInfoResponse } from 'modules/shared-links/responses/shared-link-info.response';
import { PaginatedKeywordPositionsInfoResponse } from 'modules/keywords/responses/paginated-keyword-positions-info.response';
import { KeywordPositionsInfoRequest } from 'modules/keywords/requests/keyword-positions-info.request';
import { GetKeywordResponse } from 'modules/keywords/responses/get-keyword.response';
import { Response } from 'express';
import moment from 'moment/moment';
import { SharedKeywordPositionsInfoRequest } from 'modules/shared-links/requests/shared-keyword-positions-info.request';
import { truncateFileName } from 'modules/keywords/helpers/truncateString';

@ApiTags('Shared')
@Controller('shared')
export class SharedController {
  constructor(private readonly sharedLinksService: SharedLinksService) {}

  /**
   * Retrieves the position history for a specific keyword tied to a given link.
   *
   * @param {string} link - The link associated with the keyword.
   * @param {IdType} keywordId - The identifier for the keyword.
   * @param {PositionHistoryRequest} query - Additional query parameters for the position history request.
   * @return {Promise<PositionHistoryResponse>} A promise that resolves to the position history response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PositionHistoryResponse })
  @Get(':link/keywords/:keywordId')
  positionHistory(
    @Param('link') link: string,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @Query() query: PositionHistoryRequest,
  ): Promise<PositionHistoryResponse> {
    return this.sharedLinksService.getPositionHistory({
      link,
      keywordId,
      ...query,
    });
  }

  /**
   * Exports keyword rankings information to a CSV format file.
   *
   * @param {Response} res - The HTTP response object.
   * @param {string} link - The link identifier, parsed to an integer.
   * @param {IdType} keywordId - The keyword identifier, parsed to an integer.
   * @return {Promise<void>} A promise that resolves when the CSV data has been successfully written to the response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @SharedUserAuth()
  @Get(':link/keywords/:keywordId/keyword-positions-info/export-to-csv')
  async keywordRankingsExportToCsv(
    @Res() res: Response,
    @Param('link') link: string,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
  ): Promise<void> {
    const { csvData, keywordName } =
      await this.sharedLinksService.keywordPositionsInfoExportToCsv({
        link,
        keywordId,
      });
    const fileName = `Keyword Position History for ${keywordName}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${truncateFileName(fileName)}.csv"`,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(csvData);
  }

  /**
   * Retrieves the position information for a specific keyword associated with a given link.
   *
   * @param {string} link - The link for which keyword position information is to be retrieved.
   * @param {IdType} keywordId - The identifier of the keyword for which position information is to be retrieved.
   * @param {KeywordPositionsInfoRequest} query - The query parameters for retrieving keyword position information, including pagination and sorting options.
   *
   * @return {Promise<PaginatedKeywordPositionsInfoResponse>} A promise that resolves to the paginated keyword positions information response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PaginatedKeywordPositionsInfoResponse })
  @Get(':link/keywords/:keywordId/keyword-positions-info')
  @SharedUserAuth()
  async keywordPositions(
    @Query() query: SharedKeywordPositionsInfoRequest,
    @Param('link') link: string,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
  ): Promise<PaginatedKeywordPositionsInfoResponse> {
    return this.sharedLinksService.keywordPositionsInfo(
      { link, keywordId },
      { ...query },
    );
  }

  /**
   * Retrieves information for a specified keyword.
   *
   * @param {SerpnestSharedTokenData} tokenData - User token data for authentication.
   * @param {string} link - The link associated with the keyword.
   * @param {number} keywordId - The ID of the keyword.
   * @return {Promise<GetKeywordResponse>} Promise containing the keyword information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: GetKeywordResponse })
  @Get(':link/keywords/:keywordId/keyword-info')
  @SharedUserAuth()
  getKeywordInfo(
    @UserToken() tokenData: SerpnestSharedTokenData,
    @Param('link') link: string,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
  ): Promise<GetKeywordResponse> {
    return this.sharedLinksService.getKeyword({ link, keywordId, tokenData });
  }

  /**
   * Endpoint to retrieve an overview of a specific project.
   *
   * @param {OverviewRequest} query - The query parameters for the overview request.
   * @param {SerpnestSharedTokenData} tokenData - The shared user token data.
   * @param {string} link - The link identifier.
   * @param {IdType} projectId - The unique identifier of the project.
   * @returns {Promise<ProjectOverviewResponse>} A promise that resolves to the project overview response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectOverviewResponse })
  @Get(':link/projects/:projectId/overview')
  @SharedUserAuth()
  getOverview(
    @Query() query: OverviewRequest,
    @UserToken() tokenData: SerpnestSharedTokenData,
    @Param('link') link: string,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
  ): Promise<ProjectOverviewResponse> {
    return this.sharedLinksService.getOverview({
      ...query,
      link,
      projectId,
      tokenData,
    });
  }

  /**
   * Retrieves keyword trends for a specific project based on the provided link and project ID.
   *
   * @param {string} link - The link associated with the keyword trends.
   * @param {IdType} projectId - The ID of the project for which keyword trends are being retrieved.
   * @param {KeywordTrendsRequest} query - The query parameters to filter and sort keyword trends.
   * @return {Promise<KeywordTrendsResponse>} - A promise that resolves to the keyword trends response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: KeywordTrendsResponse })
  @Get(':link/projects/:projectId/keyword-trends')
  @SharedUserAuth()
  keywordTrends(
    @Param('link') link: string,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: KeywordTrendsRequest,
  ): Promise<KeywordTrendsResponse> {
    return this.sharedLinksService.getKeywordTrends(projectId, link, {
      ...query,
    });
  }

  /**
   * Generates a comparative analysis of improved versus declined elements within a specified project.
   *
   * @param {string} link - The link parameter that identifies the specific route.
   * @param {IdType} projectId - The ID of the project being analyzed.
   * @param {ImprovedVsDeclinedRequest} query - The query parameters for filtering and sorting the data.
   * @return {Promise<ImprovedVsDeclinedArrayResponse>} Promise that resolves with the comparative analysis data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ImprovedVsDeclinedArrayResponse })
  @Get(':link/projects/:projectId/improved-vs-declined')
  @SharedUserAuth()
  improvedVsDeclined(
    @Param('link') link: string,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: ImprovedVsDeclinedRequest,
  ): Promise<ImprovedVsDeclinedArrayResponse> {
    return this.sharedLinksService.getImprovedVsDeclined({
      link,
      ...query,
      projectId,
    });
  }

  /**
   * Retrieves keyword position information for a specified link and keyword ID.
   *
   * @param {PositionHistoryRequest} query - The query parameters for the request, including the period.
   * @param {IdType} keywordId - The unique identifier of the keyword.
   * @param {string} link - The link for which the keyword position information is being requested.
   * @return {Promise<PositionHistoryResponse>} A promise that resolves to a PositionHistoryResponse containing the keyword position information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PositionHistoryResponse })
  @Get(':link/keywords/:keywordId/keyword-history-info')
  @SharedUserAuth()
  keywordPositionsInfo(
    @Query() query: PositionHistoryRequest,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @Param('link') link: string,
  ): Promise<PositionHistoryResponse> {
    return this.sharedLinksService.getKeywordPositionsInfo({
      link,
      keywordId,
      period: query.period,
    });
  }

  /**
   * Retrieves search results based on the specified link and keyword ID.
   *
   * @param {string} link - The link associated with the search query.
   * @param {IdType} keywordId - The ID of the keyword for the search query.
   * @param {SearchResultsRequest} query - The search query parameters.
   * @return {Promise<SearchResultsResponse>} A promise that resolves to the search results.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: SearchResultsResponse })
  @Get(':link/keywords/:keywordId/search-results')
  @SharedUserAuth()
  searchResults(
    @Param('link') link: string,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @Query() query: SearchResultsRequest,
  ): Promise<SearchResultsResponse> {
    return this.sharedLinksService.getSearchResults(
      { keywordId, link },
      { ...query },
    );
  }

  /**
   * Retrieves the performance data of a specific project.
   *
   * @param {string} link The link identifier associated with the project.
   * @param {IdType} projectId The unique identifier of the project.
   * @param {ProjectPerformanceRequest} query The query parameters for filtering the performance data.
   * @return {Promise<ProjectPerformanceResponse>} A promise that resolves to the project's performance data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectPerformanceResponse })
  @Get(':link/projects/:projectId/project-performance')
  @SharedUserAuth()
  projectPerformance(
    @Param('link') link: string,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: ProjectPerformanceRequest,
  ): Promise<ProjectPerformanceResponse> {
    return this.sharedLinksService.getProjectPerformance({
      link,
      projectId,
      ...query,
    });
  }

  /**
   * Fetches keyword rankings for a specific project and shared link.
   *
   * @param {string} link - The shared link identifier.
   * @param {IdType} projectId - The project identifier.
   * @param {KeywordRankingsBySharedLinkRequest} query - The query parameters for the keyword rankings.
   * @return {Promise<KeywordRankingsResponse>} A promise that resolves with the keyword rankings response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: KeywordRankingsResponse })
  @Get(':link/projects/:projectId/keyword-rankings')
  @SharedUserAuth()
  keywordRankings(
    @Param('link') link: string,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: KeywordRankingsBySharedLinkRequest,
  ): Promise<KeywordRankingsResponse> {
    return this.sharedLinksService.getKeywordRankings(
      { projectId, link },
      { ...query },
    );
  }

  /**
   * Retrieves information about a specific project associated with a shared link.
   *
   * @param {GetProjectRequest} query - The query parameters for the request.
   * @param {string} link - The link associated with the project.
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<ProjectInfoResponse>} A promise that resolves to the project information response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectInfoResponse })
  @Get(':link/projects/:projectId')
  @SharedUserAuth()
  getProjectInfo(
    @Query() query: GetProjectRequest,
    @Param('link') link: string,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
  ): Promise<ProjectInfoResponse> {
    return this.sharedLinksService.getProjectInfo({
      link,
      projectId,
      ...query,
    });
  }

  /**
   * Retrieves information about a shared link.
   *
   * @param {string} link - The shared link identifier.
   * @return {Promise<SharedLinkInfoResponse>} Information about the shared link.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: SharedLinkInfoResponse })
  @SharedUserAuth()
  @Get(':link/info')
  getSharedLinkInfo(
    @Param('link') link: string,
  ): Promise<SharedLinkInfoResponse> {
    return this.sharedLinksService.getSharedLinkInfo(link);
  }

  /**
   * Retrieves shared projects based on the provided link and query parameters.
   *
   * @param {SerpnestSharedTokenData} tokenData - The token data specific to the shared user.
   * @param {string} link - The unique identifier for the shared link.
   * @param {GetSharedRequest} query - The query parameters for the shared request.
   * @return {Promise<ProjectsBySharedLinkResponse>} - A promise that resolves to the projects associated with the shared link.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectsBySharedLinkResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @SharedUserAuth()
  @Get(':link')
  getShared(
    @UserToken() tokenData: SerpnestSharedTokenData,
    @Param('link') link: string,
    @Query() query: GetSharedRequest,
  ): Promise<ProjectsBySharedLinkResponse> {
    return this.sharedLinksService.sharedLink(
      { link, shared: tokenData?.shared },
      { ...query },
    );
  }

  /**
   * Authenticates a shared link with the given login details.
   *
   * @param {SharedLoginRequest} body - The login request containing the password.
   * @param {string} link - The shared link identifier for which login is attempted.
   * @return {Promise<SharedAccessTokenResponse>} A promise that resolves to the access token response upon successful authentication.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: SharedAccessTokenResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: BadRequestResponse })
  @Post(':link/login')
  login(
    @Body() body: SharedLoginRequest,
    @Param('link') link: string,
  ): Promise<SharedAccessTokenResponse> {
    return this.sharedLinksService.login({ link, password: body.password });
  }
}
