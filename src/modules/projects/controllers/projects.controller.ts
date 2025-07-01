import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { PaginatedProjectAvailableToUserResponse } from 'modules/projects/responses/paginated-project-available-to-user.response';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { IdType } from 'modules/common/types/id-type.type';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { UpdateProjectRequest } from 'modules/projects/requests/update-project.request';
import { GetProjectRequest } from 'modules/projects/requests/get-project.request';
import { BulkDeleteProjectRequest } from 'modules/projects/requests/bulk-delete-project.request';
import { AddKeywordsRequest } from 'modules/projects/requests/add-keywords.request';
import { MoveProjectsToFolderRequest } from 'modules/projects/requests/move-projects-to-folder.request';
import { ListAvailableProjectsResponse } from 'modules/projects/responses/list-available-projects.response';
import { RefreshAllKeywordsForProjectsRequest } from 'modules/projects/requests/refresh-all-keywords-for-projects.request';
import { ChangeFrequencyForProjectsRequest } from 'modules/projects/requests/change-frequency-for-projects.request';
import { ListAvailableProjectsRequest } from 'modules/projects/requests/list-available-projects.request';
import { GetAllProjectAvailableToUserRequest } from 'modules/projects/requests/get-all-project-available-to-user.request';
import { OverviewRequest } from 'modules/projects/requests/overview.request';
import { AddTagsRequest } from 'modules/projects/requests/add-tags.request';
import { ProjectOverviewResponse } from 'modules/projects/responses/project-overview.response';
import { ImprovedVsDeclinedRequest } from 'modules/projects/requests/improved-vs-declined.request';
import { ImprovedVsDeclinedArrayResponse } from 'modules/projects/responses/improved-vs-declined-array.response';
import { KeywordTrendsResponse } from 'modules/projects/responses/keyword-trends.response';
import { KeywordTrendsRequest } from 'modules/projects/requests/keyword-trends.request';
import { ProjectInfoResponse } from 'modules/shared-links/responses/project-info.response';
import { GetAllProjectKeywordsRequest } from 'modules/projects/requests/get-allProject-keywords.request';
import { GetProjectKeywordsResponse } from 'modules/projects/responses/get-project-keywords.response';
import { GetNumberOfProjectsKeywordsToUpdateRequest } from 'modules/projects/requests/get-number-of-projects-keywords-to-update.request';
import { GetNumberOfProjectKeywordsToUpdateResponse } from 'modules/projects/responses/get-number-of-project-keywords-to-update.response';
import { CreateProjectResponse } from 'modules/projects/responses/create-project.response';
import { CreateProjectForGoogleLocalRequest } from 'modules/projects/requests/create-project-for-google-local.request';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { CreateProjectForGoogleMapsRequest } from 'modules/projects/requests/create-project-for-google-maps.request';
import { CreateProjectForYoutubeRequest } from 'modules/projects/requests/create-project-for-youtube.request';
import { CreateProjectForBingRequest } from 'modules/projects/requests/create-project-for-bing.request';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { CreateProjectForYahooRequest } from 'modules/projects/requests/create-project-for-yahoo.request';
import { CreateProjectForBaiduRequest } from 'modules/projects/requests/create-project-for-baidu.request';
import { CreateProjectForGoogleRequest } from 'modules/projects/requests/create-project-for-google.request';
import { Response } from 'express';

@Controller('accounts')
@ApiTags('Projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/project-info-to-csv')
  async getProjectInformationInCSVFormat(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Res() res: Response,
  ) {
    const { csvData, projectName } =
      await this.projectsService.getProjectInformationInCSVFormat({
        accountId: id,
        projectId,
        userId: tokenData.user.id,
      });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${projectName}.csv"`,
    );
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    res.send(csvData);
  }

  /**
   * Retrieves an overview of the specified project based on provided parameters.
   *
   * @param {number} id - The identifier of the account.
   * @param {number} projectId - The identifier of the project.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @param {OverviewRequest} query - Additional query parameters for the request.
   * @return {Promise<ProjectOverviewResponse>} - A promise that resolves to the project overview response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectOverviewResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/overview')
  async projectOverview(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: OverviewRequest,
  ): Promise<ProjectOverviewResponse> {
    return this.projectsService.projectOverview({
      accountId: id,
      userId: tokenData.user.id,
      projectId,
      ...query,
    });
  }

  /**
   * Retrieves all keywords associated with a specific project within a user's account.
   *
   * @param {number} id - The account identifier.
   * @param {number} projectId - The project identifier within the account.
   * @param {Object} tokenData - The token data containing user information.
   * @param {Object} query - The query parameters for filtering and pagination.
   * @returns {Promise<GetProjectKeywordsResponse>} A promise that resolves to the response containing project keywords.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: GetProjectKeywordsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/keywords')
  getAllProjectKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: GetAllProjectKeywordsRequest,
  ): Promise<GetProjectKeywordsResponse> {
    return this.projectsService.getProjectKeywords(
      { accountId: id, projectId, userId: tokenData.user.id },
      { ...query },
    );
  }

  /**
   * Retrieves keyword trends for a specific project.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} projectId - The ID of the project.
   * @param {SerpnestUserTokenData} tokenData - The user token data containing user information.
   * @param {KeywordTrendsRequest} query - The query parameters for keyword trends.
   * @return {Promise<KeywordTrendsResponse>} A promise that resolves to the keyword trends response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: KeywordTrendsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/keyword-trends')
  async keywordTrends(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: KeywordTrendsRequest,
  ): Promise<KeywordTrendsResponse> {
    return this.projectsService.getKeywordTrends(
      {
        accountId: id,
        projectId,
        userId: tokenData.user.id,
        ...query,
      },
      { ...query },
    );
  }

  /**
   * Fetches and returns data representing the improvements and declines within a specified project.
   *
   * @param {IdType} id - The identifier for the account.
   * @param {IdType} projectId - The identifier for the project.
   * @param {SerpnestUserTokenData} tokenData - The user token data containing user-related details.
   * @param {ImprovedVsDeclinedRequest} query - The query parameters for the request.
   * @return {Promise<ImprovedVsDeclinedArrayResponse>} - A promise that resolves to the response containing improved vs declined data.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ImprovedVsDeclinedArrayResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/improved-vs-declined')
  async improvedVsDeclined(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: ImprovedVsDeclinedRequest,
  ): Promise<ImprovedVsDeclinedArrayResponse> {
    return this.projectsService.improvedVsDeclined({
      accountId: id,
      userId: tokenData.user.id,
      projectId,
      ...query,
    });
  }

  /**
   * Adds tags to the specified projects associated with the given account ID.
   *
   * @param {AddTagsRequest} payload - The payload containing the tags to be added and other relevant data.
   * @param {IdType} id - The account ID to which the projects belong.
   * @param {SerpnestUserTokenData} tokenData - The user token data for authentication and authorization.
   * @return {Promise<void>} A promise that resolves when the tags have been successfully added to the projects.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Post(':id/projects/add-tags')
  async addTagsToProjects(
    @Body() payload: AddTagsRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.addTagsToProjects({
      accountId: id,
      user: tokenData.user,
      ...payload,
    });
  }

  /**
   * Retrieves a list of available projects for a given user.
   *
   * @param {IdType} id - The unique identifier of the user.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @param {ListAvailableProjectsRequest} query - The query parameters for filtering the list of available projects.
   * @return {Promise<ListAvailableProjectsResponse>} A promise that resolves to a response containing the list of available projects.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ListAvailableProjectsResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin, RoleEnum.ViewOnly)
  @Get(':id/projects/list-available-projects')
  async listAvailableProjects(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Query() query: ListAvailableProjectsRequest,
  ): Promise<ListAvailableProjectsResponse> {
    return this.projectsService.getListAvailableProjects(
      tokenData.user,
      id,
      query.search,
    );
  }

  /**
   * Adds keywords to a specified project.
   *
   * @param {SerpnestUserTokenData} tokenData - The user token data of the authenticated user.
   * @param {IdType} id - The ID of the account.
   * @param {IdType} projectId - The ID of the project to which keywords will be added.
   * @param {AddKeywordsRequest} payload - The request payload containing keyword information.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to the response of the create project action.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Post(':id/projects/:projectId/add-keywords')
  addKeywords(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Body() payload: AddKeywordsRequest,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.addKeywords({
      accountId: id,
      projectId,
      user: tokenData.user,
      ...payload,
    });
  }

  /**
   * Updates the number of keywords to update for a specific project.
   *
   * @param {number} id - The unique identifier of the project.
   * @param {GetNumberOfProjectsKeywordsToUpdateRequest} payload - The payload containing the required data for the update.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<GetNumberOfProjectKeywordsToUpdateResponse>} A promise that resolves to the response containing the number of keywords to update.
   */
  @ApiOkResponse({ type: GetNumberOfProjectKeywordsToUpdateResponse })
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Patch(':id/projects/number-of-keywords-to-update')
  numberOfProjectsKeywordsToUpdate(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() payload: GetNumberOfProjectsKeywordsToUpdateRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<GetNumberOfProjectKeywordsToUpdateResponse> {
    return this.projectsService.getNumberOfProjectKeywordsToUpdate({
      ...payload,
      accountId: id,
      user: tokenData.user,
    });
  }

  /**
   * Refreshes all keywords for the specified projects.
   *
   * @param {IdType} id - The identifier of the resource.
   * @param {RefreshAllKeywordsForProjectsRequest} payload - The request payload containing project and folder IDs.
   * @param {SerpnestUserTokenData} tokenData - The user token data.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Patch(':id/projects/refresh-all-keywords')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  refreshAllKeywordsForProjects(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() payload: RefreshAllKeywordsForProjectsRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.refreshAllKeywordsForProjects(
      id,
      payload.projectIds,
      payload.folderIds,
      tokenData.user,
    );
  }

  /**
   * Changes the frequency for projects associated with a specific account.
   *
   * @param {IdType} id - The ID of the account for which the project frequency is being changed.
   * @param {ChangeFrequencyForProjectsRequest} payload - The payload containing details about the frequency change.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @return {Promise<void>} - A Promise that resolves when the operation is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Addon, RoleEnum.Admin)
  @Patch(':id/projects/change-frequency-for-projects')
  changeFrequencyForProjects(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() payload: ChangeFrequencyForProjectsRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.changeFrequencyForProjects({
      accountId: id,
      userId: tokenData.user.id,
      ...payload,
    });
  }

  /**
   * This method retrieves all projects available to a specific user based on the provided account ID.
   *
   * @param {GetAllProjectAvailableToUserRequest} query - The query parameters for retrieving the projects.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @param {IdType} id - The account ID for which the projects are to be retrieved.
   * @return {Promise<PaginatedProjectAvailableToUserResponse>} A promise that resolves to a paginated response containing the projects available to the user.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PaginatedProjectAvailableToUserResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Get(':id/projects')
  getAllProjectAvailableToUser(
    @Query() query: GetAllProjectAvailableToUserRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<PaginatedProjectAvailableToUserResponse> {
    return this.projectsService.getAllProjectAvailableToUser(
      {
        user: tokenData.user,
        accountId: id,
      },
      { ...query },
    );
  }

  /**
   * Retrieves the project information for the specified project and account.
   *
   * @param {GetProjectRequest} query - Additional query parameters for the request.
   * @param {IdType} id - The identifier of the account.
   * @param {IdType} projectId - The identifier of the project.
   * @return {Promise<ProjectInfoResponse>} The project information response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ProjectInfoResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Get(':id/projects/:projectId/project-info')
  getProjectInfo(
    @Query() query: GetProjectRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
  ): Promise<ProjectInfoResponse> {
    return this.projectsService.getProjectInfo({
      id: projectId,
      accountId: id,
      ...query,
    });
  }

  /**
   * Adds a project to a folder for a specified account.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} projectId - The ID of the project.
   * @param {IdType} folderId - The ID of the folder.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @return {Promise<void>} A promise that resolves when the project has been successfully added to the folder.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Patch(':id/projects/:projectId/add-to-folders/:folderId')
  addProjectToFolder(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.addProjectToFolder({
      accountId: id,
      folderId,
      projectId,
      user: tokenData.user,
    });
  }

  /**
   * Endpoint to create a project for Google under a specific folder for the authenticated user.
   *
   * @param {IdType} id - The account ID.
   * @param {IdType} folderId - The folder ID where the project will be created.
   * @param {CreateProjectForGoogleRequest} createPayload - The payload containing project creation details.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   *
   * @return {Promise<CreateProjectResponse>} A promise that resolves to the response containing the created project details.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-google')
  createProjectForGoogle(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForGoogleRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.create({
      ...createPayload,
      searchEngine: SearchEnginesEnum.Google,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Creates a new project for Baidu search engine within the specified folder.
   *
   * @param {number} id - The account identifier.
   * @param {number} folderId - The identifier of the folder where the project will be created.
   * @param {CreateProjectForBaiduRequest} createPayload - The payload containing data required to create the project.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information and authentication details.
   * @return {Promise<CreateProjectResponse>} A promise that resolves to the response of the created project.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-baidu')
  createProjectForBaidu(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForBaiduRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.createForBaidu({
      ...createPayload,
      searchEngine: SearchEnginesEnum.Baidu,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Creates a project specifically for Yahoo under the specified folder and account.
   *
   * @param {IdType} id - The ID of the account under which the project is to be created.
   * @param {IdType} folderId - The ID of the folder under which the project is to be created.
   * @param {CreateProjectForYahooRequest} createPayload - The payload containing the details for the new project.
   * @param {SerpnestUserTokenData} tokenData - Token data carrying user information and authentication.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to the response containing the details of the created project.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-yahoo')
  createProjectForYahoo(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForYahooRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.createForYahoo({
      ...createPayload,
      searchEngine: SearchEnginesEnum.Yahoo,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Creates a new project for Bing within a specified folder for a given account.
   *
   * @param {IdType} id - The unique identifier of the account.
   * @param {IdType} folderId - The unique identifier of the folder.
   * @param {CreateProjectForBingRequest} createPayload - The payload containing the project details.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<CreateProjectResponse>} A promise that resolves to the newly created Bing project.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-bing')
  createProjectForBing(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForBingRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.createForBing({
      ...createPayload,
      searchEngine: SearchEnginesEnum.Bing,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Creates a new project specifically for YouTube within a specified folder and account.
   *
   * @param {number} id - The account identifier.
   * @param {number} folderId - The folder identifier where the project will be created.
   * @param {object} createPayload - The payload containing creation details for the YouTube project.
   * @param {object} tokenData - The user token data which includes user details.
   * @return {Promise<CreateProjectResponse>} A promise that resolves to the newly created project response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-youtube')
  createProjectForYoutube(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForYoutubeRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.createForYoutube({
      ...createPayload,
      searchEngines: SearchEnginesEnum.YouTube,
      deviceType: DeviceTypesEnum.Desktop,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Creates a new project specifically configured for Google Maps within a specified folder.
   *
   * @param id - The unique identifier of the account.
   * @param folderId - The unique identifier of the folder where the project will be created.
   * @param createPayload - Payload containing the details for the project creation.
   * @param tokenData - User token data containing authentication and user information.
   * @return A promise that resolves to the response of the created project.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-google-maps')
  createProjectForGoogleMaps(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForGoogleMapsRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.createForGoogleMaps({
      ...createPayload,
      searchEngine: SearchEnginesEnum.GoogleMaps,
      deviceType: DeviceTypesEnum.Desktop,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Handles the creation of a new project for Google Local under a specified folder.
   *
   * @param {IdType} id - The ID of the account to which the project belongs.
   * @param {IdType} folderId - The ID of the folder under which the project will be created.
   * @param {CreateProjectForGoogleLocalRequest} createPayload - The payload containing project details.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<CreateProjectResponse>} - A promise that resolves to the response of the created project.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/folders/:folderId/projects-for-google-local')
  createProjectForGoogleLocal(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @Body() createPayload: CreateProjectForGoogleLocalRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.createForGoogleLocal({
      ...createPayload,
      searchEngines: SearchEnginesEnum.GoogleMyBusiness,
      deviceType: DeviceTypesEnum.Desktop,
      accountId: id,
      user: tokenData.user,
      folderId,
    });
  }

  /**
   * Moves multiple projects to a specified folder.
   *
   * @param {IdType} id - The account ID associated with the projects.
   * @param {MoveProjectsToFolderRequest} payload - The request payload containing project IDs to be moved.
   * @param {IdType} folderId - The ID of the folder to which the projects will be moved.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<void>} A Promise that resolves once the projects have been moved to the folder.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Patch(':id/folders/:folderId/projects')
  moveProjectsToFolder(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() payload: MoveProjectsToFolderRequest,
    @Param('folderId', new ParseIntPipe()) folderId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.moveProjectsToFolder({
      accountId: id,
      folderId,
      projectIds: payload.projectIds,
      user: tokenData.user,
    });
  }

  /**
   * Updates an existing project based on the provided project ID and account ID.
   *
   * @param {IdType} id - The ID of the account to which the project belongs.
   * @param {IdType} projectId - The ID of the project to update.
   * @param {UpdateProjectRequest} updatePayload - The new data to update the project with.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<CreateProjectResponse>} The updated project response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateProjectResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Patch(':id/projects/:projectId')
  updateProject(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @Body() updatePayload: UpdateProjectRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateProjectResponse> {
    return this.projectsService.update({
      projectId,
      accountId: id,
      user: tokenData.user,
      ...updatePayload,
    });
  }

  /**
   * Deletes a specified project for a given account.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} projectId - The ID of the project to be deleted.
   * @param {SerpnestUserTokenData} tokenData - The user token data containing the user ID.
   *
   * @return {Promise<void>} A promise that resolves when the project is successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse()
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Delete(':id/projects/:projectId')
  deleteProject(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('projectId', new ParseIntPipe()) projectId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.bulkDelete({
      accountId: id,
      projectIds: [projectId],
      userId: tokenData.user.id,
    });
  }

  /**
   * Bulk deletes multiple projects associated with a specific account ID.
   *
   * @param {number} id - The unique identifier for the account.
   * @param {BulkDeleteProjectRequest} payload - The payload containing the project IDs to be deleted.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<void>} A promise that resolves when the bulk delete operation is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiProperty()
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/projects/bulk-delete')
  bulkDelete(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() payload: BulkDeleteProjectRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.projectsService.bulkDelete({
      accountId: id,
      projectIds: payload.projectIds,
      userId: tokenData.user.id,
    });
  }
}
