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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { UserAuth } from 'modules/auth/decorators/user-auth.decorator';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { UserToken } from 'modules/auth/decorators/user-token.decorator';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { CurrentAccountResponse } from 'modules/accounts/responses/current-account.response';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { ChangeAccountSettingsRequest } from 'modules/accounts/requests/change-account-settings.request';
import { ChangeAccountBrandingRequest } from 'modules/accounts/requests/change-account-branding.request';
import { PasswordConfirmationRequest } from 'modules/accounts/requests/password-confirmation.request';
import { UsersService } from 'modules/users/services/users.service';
import { StatusResponse } from 'modules/common/responses/status.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileValidationPipe } from 'modules/common/pipes/file-validation-pipe.pipe';
import { DeleteAccountRequest } from 'modules/accounts/requests/delete-account.request';
import { DeleteAccountResponse } from 'modules/accounts/responses/delete-account.response';
import { IdType } from 'modules/common/types/id-type.type';
import { AccountsBulkDeleteRequest } from 'modules/accounts/requests/accounts-bulk-delete.request';
import { ChangeEmailRequest } from 'modules/accounts/requests/change-email.request';
import { EmailChangeConfirmationRequest } from 'modules/accounts/requests/email-change-confirmation.request';
import { AccountSearchRequest } from 'modules/accounts/requests/account-search.request';
import { AccountSearchResponse } from 'modules/accounts/responses/account-search.response';
import { ApiAccessResponse } from 'modules/accounts/responses/api-access.response';
import { CurrentAccountLimitResponse } from 'modules/accounts/responses/current-account-limit.response';
import { NecessaryRemovalRequest } from 'modules/accounts/requests/necessary-removal.request';
import { NecessaryRemovalResponse } from 'modules/accounts/responses/necessary-removal.response';

@Controller('accounts')
@ApiTags('Accounts')
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Handles request to generate a new API key for the specified account.
   *
   * @param {number} id - The unique identifier of the account for which the API key is requested.
   * @return {Promise<ApiAccessResponse>} A promise that resolves with the new API key information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ApiAccessResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Post(':id/api/request-new-key')
  requestNewKey(
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<ApiAccessResponse> {
    return this.accountsService.changeApiKey(id);
  }

  /**
   * Performs a search operation based on the provided query and user token data.
   *
   * @param {AccountSearchRequest} query - The search parameters for filtering the accounts.
   * @param {SerpnestUserTokenData} tokenData - The user token data used for authorization and authentication.
   * @param {IdType} id - The unique identifier of the entity to be searched.
   *
   * @return {Promise<AccountSearchResponse>} The search results encapsulated in a response object.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: AccountSearchResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Get(':id/search')
  async search(
    @Query() query: AccountSearchRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<AccountSearchResponse> {
    return this.accountsService.search(id, tokenData.user, { ...query });
  }

  /**
   * Handles email change confirmation using a token and new email.
   *
   * @param {string} emailConfirmationToken - The token used to confirm the email change.
   * @param {EmailChangeConfirmationRequest} query - The request object containing the new email address.
   * @return {Promise<void>} A promise that resolves when the email change is confirmed.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Get('email-change-confirmation/:emailConfirmationToken')
  emailChangeConfirmation(
    @Param('emailConfirmationToken') emailConfirmationToken: string,
    @Query() query: EmailChangeConfirmationRequest,
  ): Promise<void> {
    return this.accountsService.emailChangeConfirmation({
      emailConfirmationToken,
      newEmail: query.newEmail,
    });
  }

  /**
   * Method to change the email associated with a user account.
   *
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @param {IdType} id - The ID of the user account whose email is to be changed.
   * @param {ChangeEmailRequest} body - The request body containing the new email information.
   * @return {Promise<void>} A promise that resolves when the email change operation completes.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @UserAuth(RoleEnum.Admin)
  @Post(':id/change-email')
  changeEmail(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
    @Body() body: ChangeEmailRequest,
  ): Promise<void> {
    return this.accountsService.changeAccountEmail({
      accountId: id,
      user: tokenData.user,
      ...body,
    });
  }

  /**
   * Retrieves the current account limits based on the provided account id and user token data.
   *
   * @param {number} id - The unique identifier of the account whose limits are to be retrieved.
   * @param {object} tokenData - The user token data containing user information.
   * @return {Promise<CurrentAccountLimitResponse>} A promise that resolves to a response containing the current account limits.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: CurrentAccountLimitResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Get(':id/limits')
  getCurrentAccountLimits(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CurrentAccountLimitResponse> {
    return this.accountsService.getCurrentAccountLimits(id, tokenData.user.id);
  }

  /**
   * Retrieves the current account details for a specified account ID and user token.
   *
   * @param {number} id - The ID of the account to retrieve.
   * @param {SerpnestUserTokenData} tokenData - The user token data containing user information.
   * @return {Promise<CurrentAccountResponse>} A promise that resolves to the current account details.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: CurrentAccountResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.ViewOnly, RoleEnum.Admin, RoleEnum.Addon)
  @Get(':id')
  getCurrentAccount(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<CurrentAccountResponse> {
    return this.accountsService.getCurrentAccount(id, tokenData.user);
  }

  /**
   * Changes the default account for the logged-in user.
   *
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @param {IdType} id - The ID of the account to be set as default.
   * @return {Promise<void>} - A promise that resolves when the default account is changed.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @Patch(':id/set-as-default')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  changeDefaultAccount(
    @UserToken() tokenData: SerpnestUserTokenData,
    @Param('id', new ParseIntPipe()) id: IdType,
  ): Promise<void> {
    return this.accountsService.changeDefaultAccount(tokenData.user, id);
  }

  /**
   * Deletes multiple accounts based on the provided account IDs.
   *
   * @param {AccountsBulkDeleteRequest} payload - Object containing the list of account IDs to be deleted.
   * @param {SerpnestUserTokenData} tokenData - Object containing user data from the token.
   * @return {Promise<void>} A promise that resolves to void after deletion.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  @Post('bulk-delete')
  bulkDelete(
    @Body() payload: AccountsBulkDeleteRequest,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.accountsService.accountsBulkDelete(
      payload.accountIds,
      tokenData.user,
    );
  }

  /**
   * Method to confirm the user's password.
   *
   * @param {number} id - The ID of the user whose password is being confirmed.
   * @param {Object} tokenData - The token data of the authenticated user.
   * @param {Object} payload - The request payload containing the password to confirm.
   * @param {string} payload.password - The password to confirm.
   * @return {Promise<Object>} - A promise that resolves to a status response.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: StatusResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @UserAuth(RoleEnum.Admin)
  @Post(':id/password-confirmation')
  async passwordConfirmation(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() payload: PasswordConfirmationRequest,
  ): Promise<StatusResponse> {
    return this.userService.passwordConfirmation(
      id,
      tokenData.user,
      payload.password,
    );
  }

  /**
   * Changes the account settings for a specified account.
   *
   * @param {number} id - The ID of the account to change settings for.
   * @param {SerpnestUserTokenData} tokenData - The token data of the user making the request.
   * @param {ChangeAccountSettingsRequest} payload - The new settings to be applied to the account.
   * @return {Promise<CurrentAccountResponse>} A promise that resolves to the current account response with updated settings.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: CurrentAccountResponse })
  @UserAuth(RoleEnum.Admin)
  @Patch(':id/change-account-settings')
  changeAccountSettings(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() payload: ChangeAccountSettingsRequest,
  ): Promise<CurrentAccountResponse> {
    return this.accountsService.changeAccountSettings({
      ...payload,
      user: tokenData.user,
      accountId: id,
    });
  }

  /**
   * Endpoint to change the branding of an account by uploading a new company logo and updating relevant details.
   *
   * @param {IdType} id - The identifier of the account to be updated.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user making the request.
   * @param {ChangeAccountBrandingRequest} payload - The branding details to be updated for the account.
   * @param {Express.Multer.File} companyLogo - The uploaded file containing the new company logo.
   * @return {Promise<CurrentAccountResponse>} A promise that resolves to the updated account details.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiConsumes('multipart/form-data')
  @UserAuth(RoleEnum.Admin)
  @Patch(':id/change-account-branding')
  @UseInterceptors(FileInterceptor('companyLogo'))
  @ApiOkResponse({ type: CurrentAccountResponse })
  changeAccountBranding(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() payload: ChangeAccountBrandingRequest,
    @UploadedFile(new FileValidationPipe()) companyLogo: Express.Multer.File,
  ): Promise<CurrentAccountResponse> {
    return this.accountsService.changeAccountBranding({
      user: tokenData.user,
      ...payload,
      companyLogo,
      accountId: id,
    });
  }

  /**
   * Deletes a user's account based on the provided account ID.
   *
   * @param {number} id - The unique identifier of the account to delete.
   * @param {Object} tokenData - The user token data, containing user details and authentication information.
   * @param {Object} payload - The request payload containing additional data needed for account deletion.
   * @return {Promise<DeleteAccountResponse>} - A promise that resolves to the response object after the account is successfully deleted.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiCreatedResponse({ type: DeleteAccountResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @Post(':id')
  @UserAuth(RoleEnum.Admin)
  deleteAccount(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() payload: DeleteAccountRequest,
  ): Promise<DeleteAccountResponse> {
    return this.accountsService.deleteAccount({
      user: tokenData.user,
      ...payload,
      accountId: id,
    });
  }

  /**
   * Deletes an additional account based on the provided account ID.
   *
   * @param {number} id - The ID of the account to be deleted.
   * @param {object} tokenData - The user token data containing information about the user making the request.
   * @returns {Promise<void>} A promise that resolves when the account is deleted successfully.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Delete(':id')
  @UserAuth(RoleEnum.Admin, RoleEnum.Addon, RoleEnum.ViewOnly)
  deleteAdditionalAccount(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.accountsService.deleteAdditionalAccount({
      user: tokenData.user,
      accountId: id,
    });
  }

  /**
   * Cancels a previously scheduled account deletion for a specified user.
   *
   * @param {number} id - The unique identifier of the user's account.
   * @param {SerpnestUserTokenData} tokenData - The token data of the authenticated user.
   * @return {Promise<void>} A promise that resolves when the account deletion has been successfully canceled.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse()
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Patch(':id/cancel-account-deletion')
  @UserAuth(RoleEnum.Admin)
  cancelAccountDeletion(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
  ): Promise<void> {
    return this.accountsService.cancelAccountDeletion(tokenData.user, id);
  }

  /**
   * Processes a necessary removal request for a given account ID.
   *
   * @param {IdType} id - The unique identifier of the account.
   * @param {SerpnestUserTokenData} tokenData - The data associated with the user's token.
   * @param {NecessaryRemovalRequest} body - The request body containing details of the removal.
   * @return {Promise<NecessaryRemovalResponse>} - The response containing the result of the removal process.
   */
  @ApiCreatedResponse({ type: NecessaryRemovalResponse })
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @UserAuth(RoleEnum.Admin)
  @Post(':id/necessary-removal')
  necessaryRemoval(
    @Param('id', new ParseIntPipe()) id: IdType,
    @UserToken() tokenData: SerpnestUserTokenData,
    @Body() body: NecessaryRemovalRequest,
  ): Promise<NecessaryRemovalResponse> {
    return this.accountsService.necessaryRemoval(
      id,
      body.paddleProductId,
      tokenData.user.id,
    );
  }
}
