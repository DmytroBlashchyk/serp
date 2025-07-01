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
} from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from 'modules/users/services/users.service';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UpdateUserRequest } from 'modules/users/requests/update-user.request';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { PaginatedUsersAccountResponse } from 'modules/users/responses/paginated-users-account.response';
import { IdType } from 'modules/common/types/id-type.type';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { GetPaginatedAccountUsersRequest } from 'modules/users/requests/get-paginated-account-users.request';
import { BulkDeleteRequest } from 'modules/users/requests/bulk-delete.request';

@Controller('accounts')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly accountService: AccountsService,
  ) {}

  /**
   * Deletes a user from the system.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} userId - The ID of the user to be deleted.
   * @param {SerpnestUserTokenData} tokenData - The authentication token data of the requestor.
   * @return {Promise<void>} - A promise that resolves when the user has been deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Delete(':id/users/:userId')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin)
  @ApiNotFoundResponse({ type: BadRequestResponse })
  deleteUser(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('userId', new ParseIntPipe()) userId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.accountService.deleteUser(userId, tokenData.user, id);
  }

  /**
   * Deletes multiple users associated with a specific account.
   *
   * @param {number} id - The ID of the account from which users will be deleted.
   * @param {SerpnestUserTokenData} tokenData - Authentication token data of the user requesting the bulk delete.
   * @param {BulkDeleteRequest} payload - The payload containing a list of user IDs to be deleted.
   * @return {Promise<void>} A promise that resolves when the bulk delete operation is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post(':id/users/bulk-delete')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin)
  bulkDelete(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() payload: BulkDeleteRequest,
  ): Promise<void> {
    return this.accountService.bulkDelete(tokenData.user, payload.userIds, id);
  }

  /**
   * Retrieves a paginated list of users and invitations for a given account.
   *
   * @param {IdType} id - The unique identifier of the account.
   * @param {GetPaginatedAccountUsersRequest} query - The query parameters for pagination and filtering.
   * @return {Promise<PaginatedUsersAccountResponse>} A promise that resolves to the paginated list of users and invitations.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: PaginatedUsersAccountResponse })
  @Get(':id/users-invitations')
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Addon, RoleEnum.Admin)
  async getUsersAndInvitations(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Query() query: GetPaginatedAccountUsersRequest,
  ): Promise<PaginatedUsersAccountResponse> {
    return this.accountService.getAccountUsersAndInvitations(id, {
      ...query,
    });
  }

  /**
   * Edits a user's details for a given account.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} userId - The ID of the user to be edited.
   * @param {SerpnestUserTokenData} tokenData - Token data of the admin user performing the edit.
   * @param {UpdateUserRequest} updateUserPayload - The payload containing the updates for the user.
   * @return {Promise<void>} A promise that resolves to void when the user is successfully edited.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin)
  @Patch(':id/users/:userId')
  edit(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('userId', new ParseIntPipe()) userId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() updateUserPayload: UpdateUserRequest,
  ): Promise<void> {
    return this.usersService.editUser({
      accountId: id,
      userId,
      adminPayload: tokenData.user,
      ...updateUserPayload,
    });
  }
}
