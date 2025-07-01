import { Body, Controller, Post, Delete } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { UserSearchRequest } from 'modules/users/requests/user-search.request';
import { UserSearchesService } from 'modules/users/services/user-searches.service';

@ApiTags('User Searches')
@Controller('user-searches')
export class UserSearchesController {
  constructor(private readonly userSearchesService: UserSearchesService) {}

  /**
   * Searches for users and saves the user search record.
   *
   * @param {SerpnestUserTokenData} tokenData The token data containing user information.
   * @param {UserSearchRequest} body The request body containing the project ID.
   * @return {Promise<void>} A promise that resolves when the user search record is saved.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Post()
  userSearch(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: UserSearchRequest,
  ): Promise<void> {
    return this.userSearchesService.saveUserSearch({
      userId: tokenData.user.id,
      projectId: body.projectId,
    });
  }

  /**
   * Deletes the recently viewed search results of a user.
   *
   * @param {SerpnestUserTokenData} tokenData - The token data containing user information.
   * @return {Promise<void>} A promise that resolves when the recently viewed search results are deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Delete()
  deleteUserRecentlyViewedResults(
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.userSearchesService.clearUserRecentlyViewedResults(
      tokenData.user.id,
    );
  }
}
