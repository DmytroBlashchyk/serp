import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExcludeEndpoint,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRegistrationRequest } from 'modules/users/requests/user-registration.request';
import { UserAuthService } from 'modules/auth/services/user-auth.service';
import { LoginResponse } from 'modules/auth/responses/login.response';
import { BadRequestResponse } from 'modules/common/responses/bad-request.response';
import { LoginRequest } from 'modules/auth/requests/login.request';
import { RefreshTokenRequest } from 'modules/auth/requests/refresh-token.request';
import { ForgotPasswordRequest } from 'modules/auth/requests/forgot-password.request';
import { ResetPasswordRequest } from 'modules/auth/requests/reset-password.request';
import { ConfirmEmailRequest } from 'modules/auth/requests/confirm-email.request';
import { ResendingForgotPasswordLetterResponse } from 'modules/auth/responses/resending-forgot-password-letter.response';
import { RefreshTokenResponse } from 'modules/auth/responses/refresh-token.response';
import { LoginAccountResponse } from 'modules/auth/responses/login-account.response';
import { GoogleGuard } from 'modules/auth/guards/google.guard';
import { LoginSocialUserRequest } from 'modules/auth/requests/login-social-user.request';
import { Response } from 'express';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Get('google')
  @UseGuards(GoogleGuard)
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth() {}

  /**
   * Handles the Google authentication redirect.
   *
   * @param {Request & { user: LoginSocialUserRequest }} req - The request object containing the user information.
   * @param {Response} res - The response object used to perform the redirect.
   * @return {Promise<void>} A promise that resolves when the redirection is performed.
   */
  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  @HttpCode(HttpStatus.OK)
  async googleAuthRedirect(
    @Req() req: Request & { user: LoginSocialUserRequest },
    @Res() res: Response,
  ): Promise<void> {
    res.redirect(await this.userAuthService.getRedirectUrl(req.user));
  }

  /**
   * Handles the confirmation of email addresses.
   *
   * @param {ConfirmEmailRequest} payload - The request payload containing the data needed to confirm the email.
   * @return {Promise<void>} - A promise that resolves when the email confirmation process is complete.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @HttpCode(HttpStatus.OK)
  @Patch('confirm-email')
  @ApiBody({ type: ConfirmEmailRequest })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  async confirmEmail(@Body() payload: ConfirmEmailRequest): Promise<void> {
    return this.userAuthService.confirmEmail(payload);
  }

  /**
   * Resets the password for a user based on the provided payload.
   *
   * @param {ResetPasswordRequest} payload - The request payload containing the necessary information to reset the password.
   * @return {Promise<LoginResponse>} A promise that resolves to a LoginResponse indicating the result of the password reset operation.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @HttpCode(HttpStatus.OK)
  @Patch('reset-password')
  @ApiBody({ type: ResetPasswordRequest })
  @ApiOkResponse({ type: LoginResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  async resetPassword(
    @Body() payload: ResetPasswordRequest,
  ): Promise<LoginResponse> {
    return this.userAuthService.resetPassword(payload);
  }

  /**
   * Sends a forgot password letter to the user's registered email address.
   *
   * @param {ForgotPasswordRequest} payload - The payload containing user details needed for sending the forgot password letter.
   * @return {Promise<void>} A promise that resolves when the forgot password letter is successfully sent.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @HttpCode(HttpStatus.CREATED)
  @Post('forgot-password-letter')
  @ApiBody({ type: ForgotPasswordRequest })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  async sendForgotPasswordLetter(
    @Body() payload: ForgotPasswordRequest,
  ): Promise<void> {
    return this.userAuthService.sendForgotPasswordLetter(payload);
  }

  /**
   * Registers a new user based on the provided registration request payload.
   *
   * @param {UserRegistrationRequest} payload - The request payload containing user registration details.
   * @return {Promise<void>} A promise that resolves when the user is successfully registered.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @Post('/register-user')
  @ApiOkResponse({ type: RefreshTokenResponse })
  @ApiBadRequestResponse()
  @ApiBody({ type: UserRegistrationRequest })
  registerUser(@Body() payload: UserRegistrationRequest): Promise<void> {
    return this.userAuthService.registerUser(payload);
  }

  /**
   * Authenticates a user and returns account information.
   *
   * @param {LoginRequest} payload - The login request payload containing username and password.
   * @return {Promise<LoginAccountResponse>} - A promise that resolves to the account information of the logged-in user.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LoginAccountResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('login-user')
  login(@Body() payload: LoginRequest): Promise<LoginAccountResponse> {
    return this.userAuthService.loginUser(payload);
  }

  /**
   * Refreshes the user's authentication token.
   *
   * @param {RefreshTokenRequest} refreshTokenRequest - The request object containing the refresh token.
   * @return {Promise<LoginAccountResponse>} - A promise that resolves to the response object containing the new authentication information.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: LoginAccountResponse })
  @Post('refresh-token')
  @ApiBody({ type: RefreshTokenRequest })
  @ApiNotAcceptableResponse({ type: BadRequestResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  async refreshToken(
    @Body() { refreshToken }: RefreshTokenRequest,
  ): Promise<LoginAccountResponse> {
    return this.userAuthService.refreshToken(refreshToken);
  }

  /**
   * Handles resending the forgot password letter to the user.
   *
   * @param {ForgotPasswordRequest} payload - The request payload containing user information.
   * @return {Promise<ResendingForgotPasswordLetterResponse>} - A promise that resolves with the response of the forgot password letter resend operation.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ResendingForgotPasswordLetterResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('resending-forgot-password-letter')
  async resendingForgotPasswordLetter(
    @Body() payload: ForgotPasswordRequest,
  ): Promise<ResendingForgotPasswordLetterResponse> {
    return this.userAuthService.resendingForgotPasswordLetter(payload);
  }

  /**
   * Handles resending the mail confirmation letter based on the provided payload.
   *
   * @param {ForgotPasswordRequest} payload - The request payload containing necessary information for resending the mail confirmation letter.
   * @return {Promise<ResendingForgotPasswordLetterResponse>} - A promise resolving to the response of the resending mail confirmation letter process.
   */
  @ApiExcludeEndpoint(process.env.API_DOCUMENTATION_INCLUSION == 'true')
  @ApiOkResponse({ type: ResendingForgotPasswordLetterResponse })
  @ApiNotFoundResponse({ type: BadRequestResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @Post('resending-mail-confirmation-letter')
  async resendingMailConfirmationLetter(
    @Body() payload: ForgotPasswordRequest,
  ): Promise<ResendingForgotPasswordLetterResponse> {
    return this.userAuthService.resendingMailConfirmationLetter(payload);
  }
}
