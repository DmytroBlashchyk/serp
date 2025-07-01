import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserInvitationRequest } from 'modules/invitations/requests/create-user-invitation.request';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { InvitationsService } from 'modules/invitations/services/invitations.service';
import { IdType } from 'modules/common/types/id-type.type';
import { BulkDeleteResponse } from 'modules/invitations/requests/bulk-delete.response';
import { UpdateUserInvitationRequest } from 'modules/invitations/requests/update-user-invitation.request';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { InvitationResponse } from 'modules/invitations/responses/invitation.response';
import { InvitedUserResponse } from 'modules/invitations/responses/invited-user.response';

@Controller('accounts')
@ApiTags('Invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  /**
   * Retrieves an invitation by its ID for a specified account ID.
   *
   * @param id - The ID of the account to which the invitation belongs.
   * @param invitationId - The ID of the invitation.
   * @param tokenData - The user token data containing user information.
   * @return The detailed information of the invitation as a promise.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: InvitationResponse })
  @UserAuth(RoleEnum.Admin)
  @Get(':id/invitations/:invitationId')
  get(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('invitationId', new ParseIntPipe()) invitationId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<InvitationResponse> {
    return this.invitationsService.getInvitation({
      accountId: id,
      invitationId,
      user: tokenData.user,
    });
  }

  /**
   * Retrieves the details of an invited user based on the provided account ID and user ID.
   *
   * @param {IdType} id - The ID of the account.
   * @param {IdType} userId - The ID of the invited user.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user making the request.
   * @return {Promise<InvitedUserResponse>} - A promise that resolves to the invited user's response details.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: InvitationResponse })
  @UserAuth(RoleEnum.Admin)
  @Get(':id/users/:userId')
  getInvitedUser(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('userId', new ParseIntPipe()) userId: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<InvitedUserResponse> {
    return this.invitationsService.getInvitedUser({
      accountId: id,
      userId,
      user: tokenData.user,
    });
  }
  /**
   * Creates a new user invitation.
   *
   * @param {IdType} id - The ID of the account for which the invitation is being created.
   * @param {CreateUserInvitationRequest} payload - The data for the new user invitation.
   * @param {SerpnestUserTokenData} tokenData - The token data of the current user.
   *
   * @return {Promise<void>} A promise that resolves when the invitation is successfully created.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin)
  @Post(':id/invitations')
  create(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() payload: CreateUserInvitationRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.invitationsService.create({
      ...payload,
      admin: tokenData.user,
      accountId: id,
    });
  }

  /**
   * Updates a user invitation based on the provided account ID and invitation ID.
   *
   * @param {number} id - The unique identifier for the account.
   * @param {number} invitationId - The unique identifier for the invitation.
   * @param {UpdateUserInvitationRequest} body - The request body containing invitation update details.
   * @return {Promise<void>} A promise that resolves when the invitation is successfully updated.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin)
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Patch(':id/invitations/:invitationId')
  update(
    @Param('id', new ParseIntPipe()) id: IdType,
    @Param('invitationId', new ParseIntPipe()) invitationId: IdType,
    @Body() body: UpdateUserInvitationRequest,
  ): Promise<void> {
    return this.invitationsService.update({
      accountId: id,
      id: invitationId,
      ...body,
    });
  }

  /**
   * Deletes multiple invitation records based on IDs.
   *
   * @param {BulkDeleteResponse} body - The request payload containing an array of IDs to delete.
   * @param {IdType} id - The ID associated with the bulk delete operation, parsed as an integer.
   * @return {Promise<void>} A promise that resolves when the delete operation is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin)
  @Post(':id/invitation/bulk-delete')
  bulkDelete(
    @Body() body: BulkDeleteResponse,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<void> {
    return this.invitationsService.bulkRemove(body.ids, id);
  }
}
