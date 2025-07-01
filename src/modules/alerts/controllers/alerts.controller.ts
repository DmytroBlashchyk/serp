import {
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { AlertsServices } from 'modules/alerts/services/alerts.services';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { GetAlertsByProjectRequest } from 'modules/alerts/requests/get-alerts-by-project.request';
import { AlertsByProjectResponse } from 'modules/alerts/responses/alerts-by-project.response';
import { GetAlertsByKeywordsRequest } from 'modules/alerts/requests/get-alerts-by-keywords.request';
import { AlertsByKeywordsResponse } from 'modules/alerts/responses/alerts-by-keywords.response';
import { AlertInfoResponse } from 'modules/alerts/responses/alert-info.response';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { GetAlertKeywordsRequest } from 'modules/alerts/requests/get-alert-keywords.request';
import { AlertKeywordsResponse } from 'modules/alerts/responses/alert-keywords.response';
import { ProjectsWithAlertsResponse } from 'modules/alerts/responses/projects-with-alerts.response';
import { GetAlertProjectsRequest } from 'modules/alerts/requests/get-alert-projects.request';

@Controller('accounts')
@ApiTags('Alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsServices) {}

  /**
   * Retrieves alerts associated with a specific project.
   *
   * @param {number} id - The identifier of the project.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @param {GetAlertsByProjectRequest} query - The query parameters for retrieving alerts.
   * @return {Promise<AlertsByProjectResponse>} A promise that resolves to the alerts associated with the project.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: AlertsByProjectResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/alerts-by-project')
  getAlertsByProject(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: GetAlertsByProjectRequest,
  ): Promise<AlertsByProjectResponse> {
    return this.alertsService.getAllAlertsByProject(
      { accountId: id, user: tokenData.user },
      query,
    );
  }

  /**
   * Fetches alerts based on specified keywords for a given account.
   *
   * @param {number} id - The unique identifier for the account.
   * @param {Object} tokenData - The token data of the authenticated user.
   * @param {Object} query - The query parameters containing keywords and other filters.
   * @return {Promise<AlertsByKeywordsResponse>} A promise that resolves to the alerts filtered by keywords.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: AlertsByKeywordsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/alerts-by-keywords')
  getAlertsByKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: GetAlertsByKeywordsRequest,
  ): Promise<AlertsByKeywordsResponse> {
    return this.alertsService.getAllAlertsByKeywords(
      {
        accountId: id,
        user: tokenData.user,
      },
      query,
    );
  }

  /**
   * Fetches projects associated with a specific alert.
   *
   * @param {IdType} id - The unique identifier of the alert for which to fetch associated projects.
   * @param {GetAlertProjectsRequest} query - The query parameters for filtering the projects.
   * @return {Promise<ProjectsWithAlertsResponse>} A promise that resolves to the response containing projects with associated alerts.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectsWithAlertsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/alerts/projects')
  getProjects(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: GetAlertProjectsRequest,
  ): Promise<ProjectsWithAlertsResponse> {
    return this.alertsService.getProjects(id, query);
  }

  /**
   * Retrieves information about a specific alert.
   *
   * @param {IdType} id - The identifier of the resource.
   * @param {IdType} alertId - The identifier of the alert.
   * @return {Promise<AlertInfoResponse>} A promise that resolves to the alert information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: AlertInfoResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Get(':id/alerts/:alertId')
  getAlertInfo(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('alertId', new ParseIntPipe()) alertId: IdType,
  ): Promise<AlertInfoResponse> {
    return this.alertsService.getAlertInfo(id, alertId);
  }

  /**
   * Handles the viewing of alerts based on specified keywords.
   *
   * @param {IdType} id - The unique identifier for the account.
   * @param {IdType} accountKeywordId - The unique identifier for the keyword associated with the alert.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<void>} - A promise that resolves when the alert viewing operation is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Post(':id/alerts/:alertKeywordId/view-alert-by-keywords')
  viewAlertByKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('alertKeywordId', new ParseIntPipe()) accountKeywordId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.alertsService.viewAlertByKeywords({
      accountId: id,
      accountKeywordId,
      user: tokenData.user,
    });
  }

  /**
   * Handles the HTTP request to view a specific alert by project.
   *
   * @param {IdType} id - The identifier of the project.
   * @param {IdType} alertId - The identifier of the alert.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<void>} A promise that resolves once the alert viewing action is completed.
   */
  @Post(':id/alerts/:alertId/view-alert-by-project')
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @ApiNotFoundResponse({ type: BadRequestResponse })
  viewAlertByProject(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('alertId', new ParseIntPipe()) alertId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.alertsService.viewAlertByProject({
      accountId: id,
      alertId,
      user: tokenData.user,
    });
  }
  /**
   * Retrieves keywords associated with a specific alert for a given account.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} alertId - The ID of the alert.
   * @param {GetAlertKeywordsRequest} query - An object containing query parameters for the request.
   * @return {Promise<AlertKeywordsResponse>} A promise that resolves to an object containing the alert keywords.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: AlertKeywordsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/alerts/:alertId/keywords')
  getAlertKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('alertId', new ParseIntPipe()) alertId: IdType,
    @Query() query: GetAlertKeywordsRequest,
  ): Promise<AlertKeywordsResponse> {
    return this.alertsService.getAlertKeywords(
      { alertId, accountId: id },
      query,
    );
  }
}
