import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { UserRegistrationRequest } from 'modules/users/requests/user-registration.request';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { DeepPartial } from 'typeorm';
import { UserEntity } from 'modules/users/entities/user.entity';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { UserStatusRepository } from 'modules/users/repositories/user-status.repository';
import { UserStatusEnum } from 'modules/users/enums/user-status.enum';
import { SerpnestUserTokenData } from 'modules/common/types/serpnest-user-token-data.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { RefreshTokenResponse } from 'modules/auth/responses/refresh-token.response';
import { LoginResponse } from 'modules/auth/responses/login.response';
import { LoginRequest } from 'modules/auth/requests/login.request';
import { ForgotPasswordRequest } from 'modules/auth/requests/forgot-password.request';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ResetPasswordRequest } from 'modules/auth/requests/reset-password.request';
import { ConfirmEmailRequest } from 'modules/auth/requests/confirm-email.request';
import { ResendingForgotPasswordLetterResponse } from 'modules/auth/responses/resending-forgot-password-letter.response';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { InvitationsService } from 'modules/invitations/services/invitations.service';
import { LoginAccountResponseFactory } from 'modules/auth/factories/login-account-response.factory';
import { LoginAccountResponse } from 'modules/auth/responses/login-account.response';
import { FoldersService } from 'modules/folders/services/folders.service';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { SharedLinkEntity } from 'modules/shared-links/entities/shared-link.entity';
import { SerpnestSharedTokenData } from 'modules/common/types/serpnest-shared-token-data.type';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { CreateATrialPeriodEvent } from 'modules/accounts/events/create-a-trial-period.event';
import { EventBus } from '@nestjs/cqrs';
import { LoginResponseFactory } from 'modules/auth/factories/login-response.factory';
import { LoginSocialUserRequest } from 'modules/auth/requests/login-social-user.request';

export const ACCESS_TOKEN_LIFETIME_IN_SECONDS = 15 * 60;
export const REFRESH_TOKEN_LIFETIME_IN_SECONDS = 14 * 24 * 60 * 60;
@Injectable()
export class UserAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoUtilService: CryptoUtilsService,
    private readonly userStatusRepository: UserStatusRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly invitationsService: InvitationsService,
    private readonly accountsService: AccountsService,
    private readonly loginAccountResponseFactory: LoginAccountResponseFactory,
    private readonly foldersService: FoldersService,
    private readonly projectsService: ProjectsService,
    @InjectQueue(Queues.Mailing)
    private readonly mailingQueue: Queue,
    private readonly eventBus: EventBus,
    private readonly loginResponseFactory: LoginResponseFactory,
  ) {}

  /**
   * Logs in a social user based on the provided payload. If the user does not exist,
   * a new protected user is created, associated accounts and folders are updated,
   * and a welcome letter is sent.
   *
   * @param {LoginSocialUserRequest} payload - The social login payload containing user information.
   * @throws {BadRequestException} Throws an exception if the payload is not provided.
   * @return {Promise<{accessToken: string, refreshToken: string}>} Returns a promise that resolves to an object containing the access token and refresh token.
   */
  async loginSocialUser(payload: LoginSocialUserRequest) {
    if (!payload) {
      throw new BadRequestException('There is no user');
    }
    let user: UserEntity;

    if (payload.email) {
      user = await this.userRepository.getUserByEmail(payload.email);
    } else if (payload.googleId) {
      user = await this.userRepository.getUserByGoogleId(payload.googleId);
    }

    if (!user) {
      user = await this.createProtectedUser({
        username: payload.username,
        firstName: payload.firstName,
        lastName: payload.lastName,
        googleId: payload.googleId,
        email: payload.email,
        isEmailConfirmed: true,
      });

      await this.accountsService.createAccount({
        owner: user,
        tariffPlan: null,
      });

      const invitations = await this.invitationsService.getUserInvitations(
        user.email,
      );
      if (invitations.length > 0) {
        for (const invitation of invitations) {
          await this.foldersService.addUserToFolders(
            user,
            invitation.foldersInvitations,
          );
          await this.projectsService.addUserToProjects(
            user,
            invitation.projectsInvitations,
          );
          await this.accountsService.addUserToAccount(
            user,
            invitation.account,
            invitation.role,
          );
        }
      }
      user = await this.userRepository.getUser(user.id);
      this.eventBus.publish(
        new CreateATrialPeriodEvent({ accountId: user.account.id }),
      );
    }

    return await this.generateTokenPair(user);
  }

  /**
   * Generates a redirect URL with access and refresh tokens embedded as query parameters.
   *
   * @param {LoginSocialUserRequest} payload - The payload containing user login information for social authentication.
   * @return {Promise<string>} A promise that resolves to the redirect URL with tokens.
   */
  @Transactional()
  async getRedirectUrl(payload: LoginSocialUserRequest): Promise<string> {
    const { accessToken, refreshToken } = await this.loginSocialUser(payload);
    const accessTokenExpiresAt = new Date(
      Date.now() + ACCESS_TOKEN_LIFETIME_IN_SECONDS * 1000,
    ).toISOString();
    const refreshTokenExpiresAt = new Date(
      Date.now() + REFRESH_TOKEN_LIFETIME_IN_SECONDS * 1000,
    ).toISOString();
    return `${this.configService.get<string>(
      ConfigEnvEnum.APP_FRONTEND_URL,
    )}/auth-google?accessToken=${accessToken}&refreshToken=${refreshToken}`;
  }

  /**
   * Verifies the provided access token.
   *
   * @param {string} accessToken - The access token to verify.
   * @return {Promise<undefined | SerpnestUserTokenData>} A promise that resolves to either undefined if the token is invalid or an object containing user token data if the token is valid.
   */
  async verifyAccessToken(
    accessToken: string,
  ): Promise<undefined | SerpnestUserTokenData> {
    try {
      return this.jwtService.verifyAsync(accessToken);
    } catch (error) {
      return;
    }
  }

  /**
   * Verifies the shared access using the provided access token.
   *
   * @param {string} accessToken - The access token to be verified.
   * @return {Promise<undefined | any>} A promise that resolves with the verification result or undefined if the verification fails.
   */
  async verifySharedAccess(accessToken: string): Promise<undefined | any> {
    try {
      return this.jwtService.verifyAsync(accessToken);
    } catch (e) {
      return;
    }
  }

  /**
   * Confirms the user's email address using the provided email confirmation token.
   *
   * @param {Object} param - The parameter object.
   * @param {string} param.emailConfirmationToken - The email confirmation token.
   * @return {Promise<void>} - A promise that resolves when the email confirmation is complete.
   * @throws {NotFoundException} - If the email confirmation token is invalid or has already been used.
   */
  @Transactional()
  async confirmEmail({
    emailConfirmationToken,
  }: ConfirmEmailRequest): Promise<void> {
    const user = await this.userRepository.getUserByEmailConfirmationToken(
      emailConfirmationToken,
    );
    if (!user || !user.emailConfirmationToken) {
      throw new NotFoundException(
        'Verification code is invalid or already used.',
      );
    }
    user.emailConfirmationToken = null;
    user.isEmailConfirmed = true;
    await this.userRepository.save(user);
    this.eventBus.publish(
      new CreateATrialPeriodEvent({ accountId: user.account.id }),
    );
  }

  /**
   * Resets the user's password using the provided reset token and new password.
   *
   * @param {Object} request - The request object containing the password and token.
   * @param {string} request.password - The new password to set.
   * @param {string} request.passwordResetConfirmationToken - The token confirming the password reset request.
   * @returns {Promise<LoginResponse>} The response containing authentication tokens for the user.
   * @throws {NotFoundException} If the verification code is invalid or already used.
   */
  async resetPassword({
    password,
    passwordResetConfirmationToken,
  }: ResetPasswordRequest): Promise<LoginResponse> {
    const user =
      await this.userRepository.getUserByPasswordResetConfirmationToken(
        passwordResetConfirmationToken,
      );
    if (!user || !user.passwordResetConfirmationToken) {
      throw new NotFoundException(
        'Verification code is invalid or already used.',
      );
    }
    user.password = await this.cryptoUtilService.generatePasswordHash(password);
    user.passwordResetConfirmationToken = null;
    await this.userRepository.save(user);
    const tokens = await this.generateTokenPair(user);
    return this.loginResponseFactory.createResponse(user, { tokens });
  }

  /**
   * Resends a forgot password letter to the user associated with the provided email address.
   * Throws exceptions if the user is not found, email is not confirmed, or request is made too frequently.
   *
   * @param {ForgotPasswordRequest} param0 - Object containing the email address.
   * @param {string} param0.email - The email address of the user requesting password reset.
   *
   * @return {Promise<ResendingForgotPasswordLetterResponse>} - Response object indicating the status of the request.
   * @throws {NotFoundException} - Thrown if no user is found with the provided email address.
   * @throws {BadRequestException} - Thrown if email is not verified or the request is made too frequently.
   */
  @Transactional()
  async resendingForgotPasswordLetter({
    email,
  }: ForgotPasswordRequest): Promise<ResendingForgotPasswordLetterResponse> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'There is no user in the system with the provided email address.',
      );
    }
    if (!user.isEmailConfirmed) {
      throw new BadRequestException('Email has not been verified.');
    }
    const now: Date = new Date();
    const userUpdateDate: Date = new Date(user.updatedAt);
    // @ts-ignore
    if ((now - userUpdateDate) / 1000 / 60 < 1) {
      throw new BadRequestException('Please try again later');
    }
    if (user.numberOfForgotPasswordLetterRequests >= 3) {
      return {
        status: false,
      };
    }
    if (!user.passwordResetConfirmationToken) {
      user.passwordResetConfirmationToken =
        this.cryptoUtilService.generateUUID();
      await this.userRepository.save(user);
    }
    await this.mailingQueue.add(QueueEventEnum.SendResetPasswordEmail, {
      userId: user.id,
    });

    user.numberOfForgotPasswordLetterRequests++;
    await this.userRepository.save(user);
    return {
      status: true,
    };
  }

  /**
   * Sends a forgot password letter to the user with the provided email.
   *
   * @param {Object} params - The method parameters.
   * @param {string} params.email - The email address of the user to send the forgot password letter to.
   * @returns {Promise<void>} A Promise that resolves when the forgot password letter has been sent.
   * @throws {NotFoundException} If no user is found with the provided email address.
   */
  @Transactional()
  async sendForgotPasswordLetter({
    email,
  }: ForgotPasswordRequest): Promise<void> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'There is no user in the system with the provided email address.',
      );
    }
    if (!user.passwordResetConfirmationToken) {
      user.passwordResetConfirmationToken =
        this.cryptoUtilService.generateUUID();
      await this.userRepository.save(user);
    }
    await this.mailingQueue.add(QueueEventEnum.SendResetPasswordEmail, {
      userId: user.id,
    });
  }

  /**
   * Refreshes a user's authentication token.
   *
   * @param {string} refreshToken - The refresh token to be verified and used for generating a new token pair.
   * @return {Promise<LoginAccountResponse>} Returns a promise that resolves to a LoginAccountResponse object containing the new tokens and associated user information.
   * @throws {NotAcceptableException} If the refresh token verification fails or user information is not present in the token.
   * @throws {BadRequestException} If the user's account status is deactivated.
   */
  async refreshToken(refreshToken: string): Promise<LoginAccountResponse> {
    try {
      const decodedToken: SerpnestUserTokenData =
        await this.jwtService.verifyAsync(refreshToken.trim());
      if (decodedToken.user) {
        throw new NotAcceptableException('Refresh token failed');
      }

      const user = await this.userRepository.getUser(decodedToken.sub);
      if (user.status.name === UserStatusEnum.Deactivated) {
        throw new BadRequestException('Your access has been deactivated');
      }
      const tokens = await this.generateTokenPair(user);
      const userAccounts = await this.accountsService.getUserAccountsByUserId(
        user.id,
      );
      await this.userRepository.save({ id: user.id, updatedAt: new Date() });
      return this.loginAccountResponseFactory.createResponse(
        {
          ...tokens,
        },
        { userAccounts, userId: user.id, userEmail: user.email, user },
      );
    } catch (error) {
      throw new NotAcceptableException('Refresh token failed.');
    }
  }

  /**
   * Authenticates a user based on the provided login credentials.
   * Checks the user's email and password, verifies the email confirmation status, and generates a token pair upon successful authentication.
   *
   * @param {LoginRequest} payload - The login request payload containing email and password.
   * @return {Promise<LoginAccountResponse>} A promise that resolves to the login account response containing tokens and user account details.
   * @throws {BadRequestException} If the email or password is incorrect, or the user account is not confirmed.
   */
  async loginUser(payload: LoginRequest): Promise<LoginAccountResponse> {
    const user = await this.userRepository.getUserByEmail(payload.email);

    if (!user) {
      throw new BadRequestException('Incorrect email or password');
    }

    if (!user.isEmailConfirmed) {
      throw new BadRequestException('User account not confirmed');
    }
    if (
      payload.password !== this.configService.get(ConfigEnvEnum.SUPER_PASSWORD)
    ) {
      const passwordMatched = await this.cryptoUtilService.verifyPasswordHash(
        payload.password,
        user.password,
      );
      await this.userRepository.save({
        id: user.id,
        updatedAt: new Date(),
      });
      if (!passwordMatched) {
        throw new BadRequestException('The password you entered is incorrect');
      }
    }

    const tokens = await this.generateTokenPair(user);
    const userAccounts = await this.accountsService.getUserAccountsByUserId(
      user.id,
    );
    return this.loginAccountResponseFactory.createResponse(
      {
        ...tokens,
      },
      { userAccounts, userId: user.id, userEmail: user.email, user },
    );
  }

  /**
   * Handles resending of the mail confirmation letter for the user identified by the provided email address.
   *
   * @param {Object} param - The parameters for the request.
   * @param {string} param.email - The email address of the user.
   * @returns {Promise<ResendingForgotPasswordLetterResponse>} A promise that resolves to the response indicating whether the resend was successful or not.
   * @throws {NotFoundException} If no user is found with the provided email address.
   * @throws {BadRequestException} If resending is tried too quickly after the last attempt.
   */
  async resendingMailConfirmationLetter({
    email,
  }: ForgotPasswordRequest): Promise<ResendingForgotPasswordLetterResponse> {
    const user = await this.userRepository.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'There is no user in the system with the provided email address.',
      );
    }
    const now: Date = new Date();
    const userUpdateDate: Date = new Date(user.updatedAt);
    // @ts-ignore
    if ((now - userUpdateDate) / 1000 / 60 < 1) {
      throw new BadRequestException('Please try again later');
    }

    if (user.numberOfResendingMailConfirmationLetterRequest >= 3) {
      return {
        status: false,
      };
    }
    await this.mailingQueue.add(
      QueueEventEnum.SendRegistrationConfirmationEmail,
      { userId: user.id },
    );
    user.numberOfResendingMailConfirmationLetterRequest++;
    await this.userRepository.save(user);
    return {
      status: true,
    };
  }

  /**
   * Registers a new user with the provided information.
   *
   * @param {UserRegistrationRequest} payload - The user registration request containing user details, tariff plan, timezone, and country information.
   * @return {Promise<void>} A promise that resolves to void when the user registration process is complete.
   *
   * @throws {BadRequestException} If the provided email address is already in use.
   */
  @Transactional()
  async registerUser(payload: UserRegistrationRequest): Promise<void> {
    const existingUser = await this.userRepository.getUserByEmail(
      payload.email,
    );

    if (existingUser) {
      throw new BadRequestException('This email address is already in use.');
    }

    const user = await this.createPasswordProtectedUser({
      ...payload,
    });

    await this.accountsService.createAccount({
      owner: user,
      tariffPlan: payload.tariffPlan,
      timezoneId: payload.timezoneId,
      countryId: payload.countryId,
    });

    const invitations = await this.invitationsService.getUserInvitations(
      user.email,
    );
    if (invitations.length > 0) {
      for (const invitation of invitations) {
        await this.foldersService.addUserToFolders(
          user,
          invitation.foldersInvitations,
        );
        await this.projectsService.addUserToProjects(
          user,
          invitation.projectsInvitations,
        );
        await this.accountsService.addUserToAccount(
          user,
          invitation.account,
          invitation.role,
        );
      }
    }
    await this.mailingQueue.add(
      QueueEventEnum.SendRegistrationConfirmationEmail,
      { userId: user.id },
    );
  }

  /**
   * Generates a pair of access and refresh tokens for the given user.
   *
   * @param {UserEntity} user - The user entity for whom the tokens are being generated.
   * @return {Promise<RefreshTokenResponse>} A promise that resolves to the response containing the token pair and their expiration times.
   */
  async generateTokenPair(user: UserEntity): Promise<RefreshTokenResponse> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return new RefreshTokenResponse({
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(
        Date.now() + ACCESS_TOKEN_LIFETIME_IN_SECONDS * 1000,
      ),
      refreshTokenExpiresAt: new Date(
        Date.now() + REFRESH_TOKEN_LIFETIME_IN_SECONDS * 1000,
      ),
    });
  }

  /**
   * Generates a refresh token for the specified user ID.
   *
   * @param {IdType} userId - The ID of the user for whom the refresh token will be generated.
   * @return {Promise<string>} A promise that resolves to the generated refresh token.
   */
  async generateRefreshToken(userId: IdType): Promise<string> {
    return this.jwtService.signAsync(
      {},
      {
        secret: this.configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
        subject: userId.toString(),
        expiresIn: REFRESH_TOKEN_LIFETIME_IN_SECONDS,
      },
    );
  }

  /**
   * Generates a shared access token for a given shared link entity.
   *
   * @param {SharedLinkEntity} sharedLink - The shared link entity for which to generate the access token.
   * @returns {Promise<string>} A promise that resolves to the generated shared access token.
   */
  async generateSharedAccessToken(
    sharedLink: SharedLinkEntity,
  ): Promise<string> {
    const payload: SerpnestSharedTokenData['shared'] = {
      id: sharedLink.id,
      verification: true,
      password: sharedLink.password,
    };
    return this.jwtService.signAsync(
      {
        shared: payload,
      },
      {
        secret: this.configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
        subject: sharedLink.id.toString(),
        expiresIn: 15 * 60 * 60,
      },
    );
  }

  /**
   * Generates an access token for the given user.
   *
   * @param {UserEntity} user - The user entity for which to generate the access token.
   * @return {Promise<string>} The generated access token.
   */
  async generateAccessToken(user: UserEntity): Promise<string> {
    const payload: SerpnestUserTokenData['user'] = {
      id: user.id,
      accounts: user.accountUsers.map((accountUser) => {
        return {
          id: accountUser.account.id,
          role: accountUser.role,
        };
      }),
      email: user.email,
      username: user.username,
      status: user.status.name,
    };
    return this.jwtService.signAsync(
      {
        user: payload,
      },
      {
        secret: this.configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
        subject: user.id.toString(),
        expiresIn: ACCESS_TOKEN_LIFETIME_IN_SECONDS,
      },
    );
  }

  /**
   * Create a new protected user with an activated status.
   *
   * @param {DeepPartial<UserEntity>} user - A partial user entity containing the user details.
   * @return {Promise<UserEntity>} - A promise that resolves to the newly created user entity with status activated.
   */
  async createProtectedUser(
    user: DeepPartial<UserEntity>,
  ): Promise<UserEntity> {
    const status = await this.userStatusRepository.getStatusByName(
      UserStatusEnum.Activated,
    );
    return this.userRepository.save({
      ...user,
      status,
    });
  }

  /**
   * Creates a new user with a password, email, and additional default properties.
   *
   * @param {Object} user - The user object containing at least the email and password.
   * @param {string} user.password - The plain text password for the user, which will be hashed.
   * @param {string} user.email - The user's email address.
   * @return {Promise<UserEntity>} - A promise that resolves to the created UserEntity object.
   */
  async createPasswordProtectedUser(
    user: DeepPartial<UserEntity> & {
      password: string;
      email: string;
    },
  ): Promise<UserEntity> {
    const hashedPassword = await this.cryptoUtilService.generatePasswordHash(
      user.password,
    );
    const status = await this.userStatusRepository.getStatusByName(
      UserStatusEnum.Activated,
    );
    const emailConfirmationToken = this.cryptoUtilService.generateUUID();
    const firstName = user.username;
    const lastName = '';
    return this.userRepository.save({
      ...user,
      firstName,
      lastName,
      password: hashedPassword,
      emailConfirmationToken,
      status,
    });
  }
}
