import { ProjectsTagsService } from 'modules/tags/services/projects-tags.service';
import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetTagsRequest } from 'modules/tags/requests/get-tags.request';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { TagsResponse } from 'modules/tags/responses/tags.response';
import { KeywordsTagsService } from 'modules/tags/services/keywords-tags.service';

@Controller('accounts')
@ApiTags('Tags')
export class TagsController {
  constructor(
    private readonly tagsService: ProjectsTagsService,
    private readonly keywordsTagsService: KeywordsTagsService,
  ) {}

  /**
   * Retrieves project tags for a specified project.
   *
   * @param {GetTagsRequest} query - The request query object containing filters and other query parameters.
   * @param {IdType} id - The ID of the project for which tags are being retrieved.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<TagsResponse>} A promise that resolves to the response containing the project tags.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiResponse({ type: TagsResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Get(':id/project-tags')
  getProjectTags(
    @Query() query: GetTagsRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<TagsResponse> {
    return this.tagsService.getProjectTags({
      ...query,
      accountId: id,
      user: tokenData.user,
    });
  }

  /**
   *
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiResponse({ type: TagsResponse })
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Get(':id/keyword-tags')
  getKeywordTags(
    @Query() query: GetTagsRequest,
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<TagsResponse> {
    return this.keywordsTagsService.getKeywordTags({
      ...query,
      accountId: id,
      user: tokenData.user,
    });
  }
}
