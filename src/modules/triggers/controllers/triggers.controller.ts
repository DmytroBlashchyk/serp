import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { CreateTriggerRequest } from 'modules/triggers/requests/create-trigger.request';
import { TriggersService } from 'modules/triggers/services/triggers.service';
import { IdType } from 'modules/common/types/id-type.type';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { GeTriggersByProjectRequest } from 'modules/triggers/requests/ge-triggers-by-project.request';
import { TriggersByProjectResponse } from 'modules/triggers/responses/triggers-by-project.response';
import { TriggersByKeywordsResponse } from 'modules/triggers/responses/triggers-by-keywords.response';
import { DeleteTriggersByProjectsRequest } from 'modules/triggers/requests/delete-triggers-by-projects.request';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { DeleteTriggersByKeywordsRequest } from 'modules/triggers/requests/delete-triggers-by-keywords.request';
import { TriggerResponse } from 'modules/triggers/responses/trigger.response';
import { UpdateKeywordsTriggerRequest } from 'modules/triggers/requests/update-keywords-trigger.request';
import { GetTriggerKeywordsRequest } from 'modules/triggers/requests/get-trigger-keywords.request';
import { TriggerKeywordsResponse } from 'modules/triggers/responses/trigger-keywords.response';
import { UpdateProjectTriggerRequest } from 'modules/triggers/requests/update-project-trigger.request';
import { CreateTriggerResponse } from 'modules/triggers/responses/create-trigger.response';

@Controller('accounts')
@ApiTags('Triggers')
export class TriggersController {
  constructor(private readonly triggersService: TriggersService) {}

  /**
   * Retrieves the trigger keywords for the specified trigger and account.
   *
   * @param {IdType} id - The unique identifier for the account.
   * @param {IdType} triggerId - The unique identifier for the trigger.
   * @param {GetTriggerKeywordsRequest} query - The query parameters for retrieving trigger keywords.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<TriggerKeywordsResponse>} A promise that resolves to the trigger keywords response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Get(':id/triggers/:triggerId/keywords')
  @ApiOkResponse({ type: TriggerKeywordsResponse })
  getTriggerKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('triggerId', new ParseIntPipe()) triggerId: IdType,
    @Query() query: GetTriggerKeywordsRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<TriggerKeywordsResponse> {
    return this.triggersService.getTriggerKeywords(
      { accountId: id, triggerId, userId: tokenData.user.id },
      { ...query },
    );
  }

  /**
   * Retrieves triggers associated with a specific project.
   *
   * @param {GeTriggersByProjectRequest} query - The query parameters for the request.
   * @param {IdType} id - The unique identifier for the project.
   * @param {SerpnestUserTokenData} tokenData - User token data for authentication.
   * @return {Promise<TriggersByProjectResponse>} A promise that resolves to a response containing the project triggers.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: TriggersByProjectResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Get(':id/triggers/by-projects')
  getTriggersByProject(
    @Query() query: GeTriggersByProjectRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<TriggersByProjectResponse> {
    return this.triggersService.getTriggersByProjects(id, tokenData.user.id, {
      ...query,
    });
  }

  /**
   * Retrieves triggers based on specified keywords for a given project.
   *
   * @param {IdType} id - The unique identifier of the project.
   * @param {GeTriggersByProjectRequest} query - Query parameters containing filter criteria based on keywords.
   * @param {SerpnestUserTokenData} tokenData - The user token data containing user information.
   * @return {Promise<TriggersByKeywordsResponse>} A promise that resolves to the response containing triggers filtered by keywords.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: TriggersByKeywordsResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Get(':id/triggers/by-keywords')
  getTriggersByKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: GeTriggersByProjectRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<TriggersByKeywordsResponse> {
    return this.triggersService.getTriggersByKeywords(id, tokenData.user.id, {
      ...query,
    });
  }

  /**
   * Retrieves a specific trigger based on the provided account and trigger IDs.
   *
   * @param {IdType} id - The unique identifier of the account.
   * @param {IdType} triggerId - The unique identifier of the trigger.
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<TriggerResponse>} A promise that resolves to the trigger response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @ApiOkResponse({ type: TriggerResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Get(':id/triggers/:triggerId')
  getTrigger(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('triggerId', new ParseIntPipe()) triggerId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<TriggerResponse> {
    return this.triggersService.getTrigger({
      accountId: id,
      id: triggerId,
      userId: tokenData.user.id,
    });
  }

  /**
   * Creates a new trigger for the specified account.
   *
   * @param {CreateTriggerRequest} body - The details of the trigger to be created.
   * @param {IdType} id - The ID of the account for which the trigger is being created.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   *
   * @return {Promise<CreateTriggerResponse>} The response containing details of the created trigger.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: CreateTriggerResponse })
  @ApiNotFoundResponse({ type: BadRequestException })
  @ApiBadRequestResponse({ type: BadRequestException })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/triggers')
  create(
    @Body() body: CreateTriggerRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CreateTriggerResponse> {
    return this.triggersService.createTrigger({
      accountId: id,
      user: tokenData.user,
      ...body,
    });
  }

  /**
   * Deletes triggers associated with specific projects.
   *
   * @param {IdType} id - The unique identifier of the account.
   * @param {DeleteTriggersByProjectsRequest} body - The request body containing project details.
   * @return {Promise<void>} A promise that resolves when triggers are successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/triggers/delete-by-projects')
  deleteTriggersByProjects(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: DeleteTriggersByProjectsRequest,
  ): Promise<void> {
    return this.triggersService.deleteTriggersByProjects({
      accountId: id,
      ...body,
    });
  }

  /**
   * Deletes triggers associated with a project by specified keywords.
   *
   * @param {number} id - The unique identifier of the project.
   * @param {DeleteTriggersByProjectsRequest} body - The request body containing the deletion parameters.
   * @return {Promise<void>} A promise that resolves when the triggers are deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/triggers/delete-by-keywords')
  deleteTriggersByKeywords(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: DeleteTriggersByProjectsRequest,
  ): Promise<void> {
    return this.triggersService.deleteTriggersByKeywords({
      accountId: id,
      ...body,
    });
  }

  /**
   * Removes specified keywords from the given trigger.
   *
   * @param {IdType} id - The identifier for the account.
   * @param {DeleteTriggersByKeywordsRequest} body - The request body containing keywords to be removed.
   * @return {Promise<void>} - A promise that resolves when the keywords are removed.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/triggers/remove-keywords-from-trigger')
  removeKeywordsFromTrigger(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: DeleteTriggersByKeywordsRequest,
  ): Promise<void> {
    return this.triggersService.removeKeywordsFromTrigger({
      accountId: id,
      ...body,
    });
  }

  /**
   * Updates a keyword trigger for a given account and trigger identifier.
   *
   * @param {UpdateKeywordsTriggerRequest} body - The updated keyword trigger data.
   * @param {IdType} id - The unique identifier of the account.
   * @param {IdType} triggerId - The unique identifier of the trigger.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<void>} A promise that resolves when the update is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Patch(':id/triggers/:triggerId/update-keyword-trigger')
  updateKeywordTrigger(
    @Body() body: UpdateKeywordsTriggerRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('triggerId', new ParseIntPipe()) triggerId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.triggersService.updateKeywordTrigger({
      accountId: id,
      triggerId,
      ...body,
      userId: tokenData.user.id,
    });
  }

  /**
   * Updates a project trigger corresponding to the provided trigger ID for a specified project.
   *
   * @param {IdType} id - The ID of the project to which the trigger belongs.
   * @param {IdType} triggerId - The ID of the trigger to be updated.
   * @param {UpdateProjectTriggerRequest} body - The request body containing update details.
   * @param {SerpnestUserTokenData} tokenData - The user token data for authentication.
   * @return {Promise<void>} - A promise that resolves when the project trigger is successfully updated.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Patch(':id/triggers/:triggerId/update-project-trigger')
  updateProjectTrigger(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('triggerId', new ParseIntPipe()) triggerId: IdType,
    @Body() body: UpdateProjectTriggerRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.triggersService.updateProjectTrigger({
      accountId: id,
      triggerId,
      ...body,
      userId: tokenData.user.id,
    });
  }
}
