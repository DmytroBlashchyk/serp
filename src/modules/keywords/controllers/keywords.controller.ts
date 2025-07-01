import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { KeywordsService } from 'modules/keywords/services/keywords.service';
import { IdType } from 'modules/common/types/id-type.type';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { PositionHistoryRequest } from 'modules/keywords/requests/position-history.request';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { PositionHistoryResponse } from 'modules/keywords/responses/position-history.response';
import { KeywordRankingsRequest } from 'modules/keywords/requests/keyword-rankings.request';
import { KeywordRankingsResponse } from 'modules/keywords/responses/keyword-rankings.response';
import { ProjectPerformanceRequest } from 'modules/projects/requests/project-performance.request';
import { ProjectPerformanceResponse } from 'modules/keywords/responses/project-performance.response';
import { UpdateKeywordPositionsResponse } from 'modules/keywords/requests/update-keyword-positions.response';
import { DeleteKeywordsRequest } from 'modules/keywords/requests/delete-keywords.request';
import { SearchResultsRequest } from 'modules/keywords/requests/search-results.request';
import { SearchResultsResponse } from 'modules/keywords/responses/search-results.response';
import { GetKeywordResponse } from 'modules/keywords/responses/get-keyword.response';
import { KeywordPositionsInfoRequest } from 'modules/keywords/requests/keyword-positions-info.request';
import { KeywordsPositionsService } from 'modules/keywords/services/keywords-positions.service';
import { PaginatedKeywordPositionsInfoResponse } from 'modules/keywords/responses/paginated-keyword-positions-info.response';
import { Response } from 'express';
import moment from 'moment';
import { GetNumberOfAvailableKeywordsToUpdateRequest } from 'modules/keywords/requests/get-number-of-available-keywords-to-update.request';
import { GetNumberOfAvailableKeywordsToUpdateResponse } from 'modules/keywords/responses/get-number-of-available-keywords-to-update.response';
import { truncateFileName } from 'modules/keywords/helpers/truncateString';

@Controller('accounts')
@ApiTags('Keywords')
export class KeywordsController {
  constructor(
    private readonly keywordsService: KeywordsService,
    private readonly keywordsPositionsService: KeywordsPositionsService,
  ) {}

  /**
   * Retrieves keyword information for a given account and keyword ID.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} keywordId - The ID of the keyword.
   * @param {SerpnestUserTokenData} tokenData - The user token data.
   * @return {Promise<GetKeywordResponse>} A promise that resolves to the keyword information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: GetKeywordResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/keywords/:keywordId/keyword-info')
  keyword(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<GetKeywordResponse> {
    return this.keywordsService.getKeyword({
      accountId: id,
      keywordId,
      user: tokenData.user,
    });
  }

  /**
   * Exports the keyword rankings information to a CSV file and sends it as a response.
   *
   * @param {Response} res - The HTTP response object used to send back the CSV file.
   * @param {IdType} id - The unique identifier of the account.
   * @param {IdType} keywordId - The unique identifier of the keyword.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<void>} - A promise that resolves when the CSV data has been sent.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @ApiOkResponse()
  @Get(':id/keywords/:keywordId/keyword-positions-info/export-to-csv')
  async keywordRankingsExportToCsv(
    @Res() res: Response,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    await this.keywordsService.checkIfKeywordsAreRelatedToUserAccount(
      id,
      [keywordId],
      tokenData.user.id,
    );
    const { csvData, keywordName } =
      await this.keywordsPositionsService.keywordPositionsInfoExportToCsv({
        accountId: id,
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
   * Fetches keyword position information for a specified keyword associated with a user's account.
   *
   * @param {IdType} id - The identifier for the account.
   * @param {IdType} keywordId - The identifier for the keyword.
   * @param {KeywordPositionsInfoRequest} query - Additional query parameters for fetching keyword positions info.
   * @param {SerpnestUserTokenData} tokenData - The token data representing the user's session.
   * @return {Promise<PaginatedKeywordPositionsInfoResponse>} A promise resolving to the keyword positions information in a paginated format.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PaginatedKeywordPositionsInfoResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/keywords/:keywordId/keyword-positions-info')
  async keywordPositions(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @Query() query: KeywordPositionsInfoRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<PaginatedKeywordPositionsInfoResponse> {
    await this.keywordsService.checkIfKeywordsAreRelatedToUserAccount(
      id,
      [keywordId],
      tokenData.user.id,
    );
    return this.keywordsPositionsService.keywordPositionsInfo(
      { accountId: id, keywordId },
      { ...query },
    );
  }

  /**
   * Retrieves search results based on the provided account id, keyword id, query parameters,
   * and user token data.
   *
   * @param {IdType} id - The identifier of the account.
   * @param {IdType} keywordId - The identifier of the keyword.
   * @param {SearchResultsRequest} query - The search query parameters.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<SearchResultsResponse>} The search results.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: SearchResultsResponse })
  @Get(':id/keywords/:keywordId/search-results')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  searchResults(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @Query() query: SearchResultsRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<SearchResultsResponse> {
    return this.keywordsService.searchResults(
      { keywordId, accountId: id, userId: tokenData.user.id },
      { ...query },
    );
  }

  /**
   * Retrieves the position history of a specific keyword for a given account.
   * @param {IdType} id - The unique identifier of the account.
   * @param {IdType} keywordId - The unique identifier of the keyword.
   * @param {PositionHistoryRequest} query - The query parameters for the position history request.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<PositionHistoryResponse>} A promise that resolves to the position history response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PositionHistoryResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/keywords/:keywordId')
  positionHistory(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('keywordId', new ParseIntPipe()) keywordId: IdType,
    @Query() query: PositionHistoryRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<PositionHistoryResponse> {
    return this.keywordsService.getPositionHistory({
      keywordId,
      accountId: id,
      userId: tokenData.user.id,
      ...query,
    });
  }

  /**
   * Retrieves the performance details of a specific project associated with a given account.
   *
   * @param {number} id - The primary identifier for the account.
   * @param {number} projectId - The specific identifier for the project.
   * @param {ProjectPerformanceRequest} query - The query parameters for the performance request.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<ProjectPerformanceResponse>} A promise that resolves to the project performance data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectPerformanceResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/project-performance')
  projectPerformance(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: ProjectPerformanceRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<ProjectPerformanceResponse> {
    return this.keywordsService.getProjectPerformance({
      accountId: id,
      userId: tokenData.user.id,
      projectId,
      ...query,
    });
  }

  /**
   * Retrieves keyword rankings for a given project.
   *
   * @param {number} id - The ID of the account associated with the keyword rankings.
   * @param {number} projectId - The ID of the project for which keyword rankings are retrieved.
   * @param {KeywordRankingsRequest} query - Query parameters for filtering and sorting the keyword rankings.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @return {Promise<KeywordRankingsResponse>} A promise that resolves to the keyword rankings response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: KeywordRankingsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/keyword-rankings')
  keywordRankings(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Query() query: KeywordRankingsRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<KeywordRankingsResponse> {
    return this.keywordsService.getKeywordRankings(
      {
        projectId,
        accountId: id,
        userId: tokenData.user.id,
      },
      { ...query },
    );
  }

  /**
   * Updates the number of available keywords for a specified project.
   *
   * @param {number} id - The account ID to which the project belongs.
   * @param {GetNumberOfAvailableKeywordsToUpdateRequest} body - The request body containing the necessary data to update the keywords.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @return {Promise<GetNumberOfAvailableKeywordsToUpdateResponse>} - A promise that resolves to the response containing the number of available keywords to update.
   */
  @ApiOkResponse({ type: GetNumberOfAvailableKeywordsToUpdateResponse })
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Patch(':id/projects/:projectId/number-of-available-keywords-to-update')
  getNumberOfAvailableKeywordsToUpdate(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: GetNumberOfAvailableKeywordsToUpdateRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<GetNumberOfAvailableKeywordsToUpdateResponse> {
    return this.keywordsService.getNumberOfAvailableKeywordsToUpdate({
      ...body,
      accountId: id,
      userId: tokenData.user.id,
    });
  }

  /**
   * Updates the positions of keywords for a specified project.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} projectId - The ID of the project.
   * @param {SerpnestUserTokenData} tokenData - The token data for the user performing the operation.
   * @param {UpdateKeywordPositionsResponse} body - The data containing updated keyword positions.
   * @return {Promise<void>} A promise that resolves when the keyword positions have been updated.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Post(':id/projects/:projectId/update-keyword-positions')
  updateKeywordPositions(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: UpdateKeywordPositionsResponse,
  ): Promise<void> {
    return this.keywordsService.updateKeywordPositions({
      accountId: id,
      projectId,
      user: tokenData.user,
      ...body,
    });
  }

  /**
   * Deletes keywords for a specific project under a given account.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} projectId - The ID of the project.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user.
   * @param {DeleteKeywordsRequest} body - The request body containing keywords to be deleted.
   * @return {Promise<void>} A promise that resolves when the keywords are successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Post(':id/projects/:projectId/delete-keywords')
  deleteKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: DeleteKeywordsRequest,
  ): Promise<void> {
    return this.keywordsService.deleteProjectKeywords({
      accountId: id,
      projectId,
      user: tokenData.user,
      ...body,
    });
  }
}
