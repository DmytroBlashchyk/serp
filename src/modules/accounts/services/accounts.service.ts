import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { CreateAccountType } from 'modules/accounts/types/create-account.type';
import { CountriesService } from 'modules/countries/services/countries.service';
import { TimezonesService } from 'modules/timezones/services/timezones.service';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { CurrentResponseFactory } from 'modules/accounts/factories/current-response.factory';
import { CurrentAccountResponse } from 'modules/accounts/responses/current-account.response';
import { ChangeAccountSettingsType } from 'modules/accounts/types/change-account-settings.type';
import { IdType } from 'modules/common/types/id-type.type';
import { AccountEntity } from 'modules/accounts/entities/account.entity';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { ChangePasswordType } from 'modules/accounts/types/change-password.type';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { ChangeAccountBrandingType } from 'modules/accounts/types/change-account-branding.type';
import { bufferToStream } from 'modules/common/utils/bufferToStream';
import { StorageService } from 'modules/storage/services/storage.service';
import { BucketStoragePathsEnum } from 'modules/storage/enums/bucket-storage-paths.enum';
import {
  runOnTransactionRollback,
  Transactional,
} from 'typeorm-transactional-cls-hooked';
import { DeleteAccountType } from 'modules/accounts/types/delete-account.type';
import { ReasonsForAccountDeletionRepository } from 'modules/accounts/repositories/reasons-for-account-deletion.repository';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import moment from 'moment';
import { DeleteAccountResponse } from 'modules/accounts/responses/delete-account.response';
import { UserEntity } from 'modules/users/entities/user.entity';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { PaginatedUsersAccountResponse } from 'modules/users/responses/paginated-users-account.response';
import { GetPaginatedAccountUsersRequest } from 'modules/users/requests/get-paginated-account-users.request';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { RoleEntity } from 'modules/users/entities/role.entity';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { EditUserType } from 'modules/users/types/edit-user.type';
import { DeleteAdditionalAccountType } from 'modules/accounts/types/delete-additional-account.type';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { ChangeAccountEmailType } from 'modules/accounts/types/change-account-email.type';
import { FoldersService } from 'modules/folders/services/folders.service';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { AccountSearchRequest } from 'modules/accounts/requests/account-search.request';
import { AccountSearchResponseFactory } from 'modules/accounts/factories/account-search-response.factory';
import { AccountSearchResponse } from 'modules/accounts/responses/account-search.response';
import { SerpnestApiKeyData } from 'modules/api/types/serpnest-api-key-data.type';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ApiAccessResponse } from 'modules/accounts/responses/api-access.response';
import { ApiAccountInfoType } from 'modules/api/types/api-account-info.type';
import { EventBus } from '@nestjs/cqrs';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { UserSearchesService } from 'modules/users/services/user-searches.service';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { AccountSearchType } from 'modules/accounts/types/account-search.type';
import { UsersInvitationsAccountFactory } from 'modules/users/factories/users-invitations-account.factory';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CurrentAccountLimitsResponseFactory } from 'modules/accounts/factories/current-account-limits-response.factory';
import { CurrentAccountLimitResponse } from 'modules/accounts/responses/current-account-limit.response';
import { NecessaryRemovalResponse } from 'modules/accounts/responses/necessary-removal.response';
import { NecessaryRemovalResponseFactory } from 'modules/accounts/factories/necessary-removal-response.factory';
import { UpdateAccountUserType } from 'modules/users/types/update-account-user.type';
import { UnsubscriptionEvent } from 'modules/subscriptions/events/unsubscription.event';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { UserFactory } from 'modules/users/factories/user.factory';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import { CustomerUpgradeEvent } from 'modules/subscriptions/events/customer-upgrade.event';
import { encodeSpecificEmailChars } from 'modules/common/utils/encodeSpecificEmailChars';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { CompleteAccountDeletionEvent } from 'modules/accounts/events/complete-account-deletion.event';

@Injectable()
export class AccountsService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly countriesService: CountriesService,
    private readonly timezoneService: TimezonesService,
    private readonly currentResponseFactory: CurrentResponseFactory,
    private readonly userRepository: UserRepository,
    private readonly cryptoUtilService: CryptoUtilsService,
    private readonly storageService: StorageService,
    private readonly reasonsForAccountDeletionRepository: ReasonsForAccountDeletionRepository,
    private readonly mailingService: MailingService,
    private readonly accountUserRepository: AccountUserRepository,
    private readonly usersInvitationsAccountFactory: UsersInvitationsAccountFactory,
    private readonly roleRepository: RoleRepository,
    private readonly invitationRepository: InvitationRepository,
    private readonly foldersService: FoldersService,
    private readonly accountSearchResponseFactory: AccountSearchResponseFactory,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
    private readonly tariffPlanSettingRepository: TariffPlanSettingRepository,
    private readonly userSearchesService: UserSearchesService,
    @InjectQueue(Queues.Mailing)
    private readonly mailingQueue: Queue,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly currentAccountLimitsResponseFactory: CurrentAccountLimitsResponseFactory,
    private readonly tariffPlansService: TariffPlansService,
    private readonly necessaryRemovalResponseFactory: NecessaryRemovalResponseFactory,
    private readonly gatewayService: GatewayService,
    private readonly userFactory: UserFactory,
  ) {}

  /**
   * Updates the account user details such as role, folders, and projects.
   *
   * @param {UpdateAccountUserType} payload - The data to update the account user.
   * The payload includes accountId, userId, roleName, folderIds, and projectIds.
   * Payload structure:
   * {
   *   accountId: number,
   *   userId: number,
   *   roleName?: string,
   *   folderIds?: number[],
   *   projectIds?: number[]
   * }
   *
   * @return {Promise<void>} Returns a promise that resolves with no value.
   *
   * @throws {NotFoundException} Throws an exception if the account user is not found.
   */
  @Transactional()
  async updateAccountUser(payload: UpdateAccountUserType): Promise<void> {
    const accountUser = await this.accountUserRepository.getAccountUserWithRole(
      payload.accountId,
      payload.userId,
    );
    if (!accountUser) {
      throw new NotFoundException('Account user not found.');
    }
    if (payload.roleName) {
      const role = await this.roleRepository.getRoleByName(payload.roleName);
      await this.accountUserRepository.save({ id: accountUser.id, role });
    }

    if (payload.folderIds) {
      const deletedFolders = [];
      const newFolders = [];
      const currentAccountFolders =
        await this.accountUserRepository.getIdsOfAccountUserFolders(
          payload.accountId,
          payload.userId,
        );
      for (const id of currentAccountFolders) {
        if (!payload.folderIds.find((i) => i == id)) {
          deletedFolders.push(id);
        }
      }

      for (const id of payload.folderIds) {
        if (!currentAccountFolders.find((i) => i == id)) {
          newFolders.push(id);
        }
      }

      if (deletedFolders?.length > 0) {
        await this.accountUserRepository.removeLinkBetweenFoldersAndUser(
          payload.userId,
          deletedFolders,
        );
      }
      if (newFolders?.length > 0) {
        await this.accountUserRepository.addALinkBetweenFoldersAndUser(
          payload.userId,
          newFolders,
        );
      }
    }
    if (payload.projectIds?.length > 0) {
      const currentAccountProjects =
        await this.accountUserRepository.getIdsOfAccountUserProjects(
          payload.accountId,
          payload.userId,
        );
      const deletedProjects = [];
      const newProjects = [];
      for (const id of currentAccountProjects) {
        if (!payload.projectIds.find((i) => i == id)) {
          deletedProjects.push(id);
        }
      }
      for (const id of payload.projectIds) {
        if (!currentAccountProjects.find((i) => i == id)) {
          newProjects.push(id);
        }
      }
      if (deletedProjects?.length > 0) {
        await this.accountUserRepository.removeLinkBetweenProjectsAndUser(
          payload.userId,
          deletedProjects,
        );
      }
      if (newProjects?.length > 0) {
        await this.accountUserRepository.addALinkBetweenProjectsAndUser(
          payload.userId,
          newProjects,
        );
      }
    }
  }

  /**
   * Determines the necessary removal actions required based on account limits and tariff plan settings.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {string} paddleProductId - The ID of the paddle product.
   * @param {IdType} userId - The ID of the user associated with the account.
   * @return {Promise<NecessaryRemovalResponse>} - A promise that resolves to the necessary removal response.
   */
  async necessaryRemoval(
    accountId: IdType,
    paddleProductId: string,
    userId: IdType,
  ): Promise<NecessaryRemovalResponse> {
    const currentLimits =
      await this.accountLimitsService.getAllLimitsOfCurrentAccount(
        accountId,
        userId,
      );
    const planLimits =
      await this.tariffPlansService.getTariffPlanSettingWithLimits(
        paddleProductId,
      );
    return this.necessaryRemovalResponseFactory.createResponse(currentLimits, {
      planLimits,
    });
  }

  /**
   * Retrieves the current time for a specified account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<{hours: number, minutes: number}>} A promise that resolves to an object containing the current hours and minutes of the account.
   */
  async getCurrentTimeOfAccount(
    accountId: IdType,
  ): Promise<{ hours: number; minutes: number }> {
    return this.accountRepository.getCurrentTimeByAccountId(accountId);
  }

  /**
   * Fetches account information for a given account ID.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<ApiAccountInfoType>} A promise that resolves to the account information.
   */
  async getAccountInfo(accountId: IdType): Promise<ApiAccountInfoType> {
    return await this.accountRepository.getAccountInfoById(accountId);
  }

  /**
   * Changes the API key for the given account.
   *
   * @param {IdType} accountId - The ID of the account for which to change the API key.
   * @return {Promise<ApiAccessResponse>} A promise that resolves with the updated API access information, including the new API key, available endpoints, and initial API credits.
   */
  async changeApiKey(accountId: IdType): Promise<ApiAccessResponse> {
    let account = await this.accountRepository.getAccountById(accountId);
    account = await this.saveApiKey(account);
    return new ApiAccessResponse({
      apiKey: account.apiKey,
      apiEndpoints: `${this.configService.get(
        ConfigEnvEnum.APP_FRONTEND_URL,
      )}/api/v1?api_key=${account.apiKey}`,
      apiCredits: 0,
    });
  }

  /**
   * Performs a search for accounts based on the provided options.
   *
   * @param {IdType} accountId - The ID of the account to be searched.
   * @param {UserPayload} user - The user payload containing user-specific information.
   * @param {AccountSearchRequest} options - The search request options, including search string and filters.
   * @return {Promise<AccountSearchResponse>} A promise that resolves to the search response, including search results and recently viewed accounts.
   */
  async search(
    accountId: IdType,
    user: UserPayload,
    options: AccountSearchRequest,
  ): Promise<AccountSearchResponse> {
    let result: AccountSearchType[] = [];
    if (options.search.length > 3) {
      result = await this.accountRepository.searchByAccount(accountId, options);
    }
    const recentlyViewed =
      await this.userSearchesService.getLatestCustomSearchResults(user.id);
    return this.accountSearchResponseFactory.createResponse(result, {
      ...options,
      recentlyViewed,
    });
  }

  /**
   * Confirms the change of a user's email address using a provided confirmation token.
   *
   * @param {Object} params - The parameters for email change confirmation.
   * @param {string} params.emailConfirmationToken - The token for email confirmation.
   * @param {string} params.newEmail - The new email address to be confirmed.
   * @return {Promise<void>} - A promise that resolves when the email change process is complete.
   * @throws {NotFoundException} - Throws if no user is found with the provided email confirmation token.
   */
  async emailChangeConfirmation({
    emailConfirmationToken,
    newEmail,
  }: {
    emailConfirmationToken: string;
    newEmail: string;
  }): Promise<void> {
    const user = await this.userRepository.getUserByEmailConfirmationToken(
      emailConfirmationToken,
    );
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    const oldEmail = user.email;
    user.email = newEmail;
    user.emailConfirmationToken = this.cryptoUtilService.generateUUID();
    user.isEmailConfirmed = false;
    await this.userRepository.save(user);
    await this.mailingQueue.add(
      QueueEventEnum.SendAnEmailAboutSuccessfulEmailChange,
      { oldEmail, userId: user.id },
    );
    await this.mailingQueue.add(QueueEventEnum.SendAnEmailToConfirmNewEmail, {
      userId: user.id,
    });
    this.eventBus.publish(
      new CustomerUpgradeEvent({ userId: user.id, newEmail }),
    );
  }

  /**
   * Changes the email address of an account owner after verifying the provided password
   * and confirming the new email address does not already exist.
   *
   * @param {ChangeAccountEmailType} payload - The payload containing account and user details,
   *                                            the new email address, and the confirmation password.
   * @param {string} payload.accountId - The ID of the account whose email is being changed.
   * @param {Object} payload.user - The user object of the account owner.
   * @param {string} payload.user.id - The ID of the user.
   * @param {string} payload.confirmationPassword - The password to confirm the user's identity.
   * @param {string} payload.newEmail - The new email address to be associated with the account.
   *
   * @throws {ForbiddenException} If the user is not the owner of the account.
   * @throws {BadRequestException} If the confirmation password is incorrect
   *                               or if the new email is already in use.
   *
   * @return {Promise<void>} A promise that resolves when the email change process is complete.
   */
  async changeAccountEmail(payload: ChangeAccountEmailType): Promise<void> {
    const userAccount =
      await this.accountUserRepository.getAccountUserWithUserByAccountIdAndUserId(
        payload.accountId,
        payload.user.id,
      );
    if (userAccount.account.owner.id != payload.user.id) {
      throw new ForbiddenException('Access denied');
    }
    const user = userAccount.account.owner;

    if (user.password) {
      const passwordMatched = await this.cryptoUtilService.verifyPasswordHash(
        payload.confirmationPassword,
        user.password,
      );
      if (!passwordMatched) {
        throw new BadRequestException({
          message: 'Input data validation failed',
          errors: {
            confirmationPassword: 'Incorrect password provided.',
          },
        });
      }
    }

    const existingUser = await this.userRepository.getUserByEmail(
      payload.newEmail,
    );
    if (existingUser) {
      throw new BadRequestException({
        message: 'Input data validation failed',
        errors: {
          newEmail: 'A user with this email already exists.',
        },
      });
    }
    user.emailConfirmationToken = this.cryptoUtilService.generateUUID();
    await this.userRepository.save(user);

    await this.mailingQueue.add(QueueEventEnum.SendALetterToChangeEmail, {
      userId: user.id,
      newEmail: encodeSpecificEmailChars(payload.newEmail),
    });
  }

  /**
   * Deletes an additional account associated with the user.
   *
   * @param {DeleteAdditionalAccountType} payload - The payload containing the details for the additional account deletion.
   * @throws {NotFoundException} If the account is not found.
   * @throws {ForbiddenException} If attempting to delete the user's own account.
   * @return {Promise<void>} A promise that resolves when the account has been successfully deleted.
   */
  async deleteAdditionalAccount(
    payload: DeleteAdditionalAccountType,
  ): Promise<void> {
    const userAccount =
      await this.accountUserRepository.getAccountUserWithUserByAccountIdAndUserId(
        payload.accountId,
        payload.user.id,
      );
    if (!userAccount) {
      throw new NotFoundException('Account not found.');
    }
    if (userAccount.account.owner.id == payload.user.id) {
      throw new ForbiddenException(
        'It is forbidden to delete your own account.',
      );
    }
    await this.accountUserRepository.remove(userAccount);
    await this.invitationRepository.removeInvitationByInvitationUserAndAccountId(
      userAccount.user.email,
      payload.accountId,
    );
    const userAccountByDefault =
      await this.accountUserRepository.getUserAccountByDefault(payload.user.id);
    if (!userAccountByDefault) {
      const account = await this.accountUserRepository.getAnAccountByOwnerId(
        payload.user.id,
      );
      await this.accountUserRepository.save({ ...account, byDefault: true });
    }
  }

  /**
   * Changes the role of a user associated with a specific account.
   *
   * @param {EditUserType} payload - The data required to change the user account including account ID, user ID, role name, and admin information.
   * @return {Promise<void>} A promise that resolves when the user account has been successfully changed.
   * @throws {NotFoundException} If the user account or role is not found.
   * @throws {BadRequestException} If attempting to change the owner of the account.
   */
  async changeUserAccount(payload: EditUserType): Promise<void> {
    const userAccount =
      await this.accountUserRepository.getAccountUserWithUserByAccountIdAndUserId(
        payload.accountId,
        payload.userId,
      );
    if (!userAccount) {
      throw new NotFoundException('User account not found.');
    }

    if (userAccount.account.owner.id == payload.userId) {
      throw new BadRequestException(
        'It is forbidden to change the owner of the account',
      );
    }
    if (!userAccount) {
      throw new NotFoundException('User Account not found.');
    }
    const role = await this.roleRepository.getRoleByName(payload.roleName);
    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    await this.accountUserRepository.save({ ...userAccount, role });

    await this.mailingQueue.add(
      QueueEventEnum.SendAccountPermissionChangeNotification,
      {
        accountId: payload.accountId,
        userId: payload.userId,
        roleName: payload.roleName,
        adminId: payload.adminPayload.id,
      },
    );
  }

  /**
   * Changes the default account for a given user.
   *
   * @param {UserPayload} user - The user payload object containing user details.
   * @param {IdType} accountId - The account ID that needs to be set as the default.
   * @return {Promise<void>} A promise that resolves when the default account has been changed.
   */
  async changeDefaultAccount(
    user: UserPayload,
    accountId: IdType,
  ): Promise<void> {
    const userAccounts =
      await this.accountUserRepository.getAccountsByUserIdAndAccountIds(
        user.id,
        user.accounts.map((item) => item.id),
      );
    const updateUserAccounts = [];
    for (const account of userAccounts) {
      if (account.account.id == accountId) {
        updateUserAccounts.push({ ...account, byDefault: true });
      } else {
        updateUserAccounts.push({ ...account, byDefault: false });
      }
    }

    await this.accountUserRepository.save(updateUserAccounts);
  }

  /**
   * Retrieves the user accounts associated with the given user ID.
   *
   * @param {IdType} userId - The unique identifier of the user.
   * @return {Promise<Array<AccountUserEntity>>} A promise that resolves to an array of AccountUserEntity objects.
   * @throws {NotFoundException} If no accounts are found for the specified user ID.
   */
  async getUserAccountsByUserId(
    userId: IdType,
  ): Promise<Array<AccountUserEntity>> {
    const accounts = await this.accountUserRepository.getUserAccounts(userId);
    if (accounts.length === 0) {
      throw new NotFoundException('Accounts not found.');
    }
    return accounts;
  }

  /**
   * Retrieves the user and account entity based on the provided userId and accountId.
   *
   * @param {IdType} userId - The unique identifier of the user.
   * @param {IdType} accountId - The unique identifier of the account.
   * @return {Promise<AccountUserEntity>} A promise that resolves to the user and account entity.
   */
  async getUserAndAccountByUserIdAndAccountId(
    userId: IdType,
    accountId: IdType,
  ): Promise<AccountUserEntity> {
    return this.accountUserRepository.getUserAccount(userId, accountId);
  }

  /**
   * Deletes multiple user accounts in bulk.
   *
   * @param {IdType[]} accountIds - An array of account IDs to be deleted.
   * @param {UserPayload} userPayload - The payload containing user information.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async accountsBulkDelete(
    accountIds: IdType[],
    userPayload: UserPayload,
  ): Promise<void> {
    const userAccounts = await this.getExistingUserAccounts(
      userPayload.id,
      accountIds,
    );
    for (const account of userAccounts) {
      if (account.account.owner.id == userPayload.id) {
        throw new ForbiddenException('Access denied');
      }
    }
    await this.accountUserRepository.remove(userAccounts);
    const user = await this.userRepository.getUserById(userPayload.id);
    for (const account of userAccounts) {
      await this.invitationRepository.removeInvitationByInvitationUserAndAccountId(
        user.email,
        account.account.id,
      );
    }

    const userAccountByDefault =
      await this.accountUserRepository.getUserAccountByDefault(user.id);
    if (!userAccountByDefault) {
      const account = await this.accountUserRepository.getAnAccountByOwnerId(
        user.id,
      );
      await this.accountUserRepository.save({ ...account, byDefault: true });
    }
  }

  /**
   * Removes a list of users from an account in bulk, ensuring that specified constraints and permissions are respected.
   * Throws a ForbiddenException if the admin attempts to remove the owner of the account.
   * Throws a NotFoundException if no valid users are found for the provided user IDs.
   *
   * @param {UserPayload} adminPayload - The payload of the admin performing the action.
   * @param {IdType[]} userIds - List of user IDs to be deleted.
   * @param {IdType} accountId - The ID of the account from which users are to be deleted.
   *
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  @Transactional()
  async bulkDelete(
    adminPayload: UserPayload,
    userIds: IdType[],
    accountId: IdType,
  ): Promise<void> {
    const userAccount = await this.getExistingUserAccount(
      adminPayload.id,
      accountId,
    );
    const owner = userIds.find((item) => item == userAccount.owner.id);
    if (owner) {
      throw new ForbiddenException('Access denied');
    }
    const accountUsers =
      await this.accountUserRepository.getAccountUsersWithUserByAccountIdAndUserIds(
        userAccount.id,
        userIds,
      );
    if (!accountUsers || accountUsers.length === 0) {
      throw new NotFoundException('User not found.');
    }

    await this.accountUserRepository.remove([...accountUsers]);
    const invitationUsers: string[] = [];
    for (const account of accountUsers) {
      invitationUsers.push(account.user.email);
    }

    await this.invitationRepository.removeInvitationsByInvitationUsersAndAccountId(
      invitationUsers,
      accountId,
    );
    await this.accountLimitsService.accountingOfUsers(
      accountId,
      invitationUsers.length * -1,
    );

    await this.mailingQueue.add(
      QueueEventEnum.SendLettersToUsersAboutDeletingThemFromTheirAccount,
      { accountId: userAccount.id, userIds, adminId: adminPayload.id },
    );

    this.eventBus.publish(new RefreshFolderTreeEvent({ accountId }));
  }

  /**
   * Deletes a user from a specified account. This operation is transactional and will
   * also remove any related invitations and notify the mailing queue.
   *
   * @param {IdType} userId - The unique identifier of the user to be deleted.
   * @param {UserPayload} adminPayload - The user payload of the admin performing the deletion.
   * @param {IdType} accountId - The unique identifier of the account from which the user is to be deleted.
   *
   * @return {Promise<void>} - A promise that resolves when the user has been successfully deleted.
   * @throws {NotFoundException} - When the user is not found.
   * @throws {ForbiddenException} - When the operation is forbidden, such as trying to delete the account owner.
   */
  @Transactional()
  async deleteUser(
    userId: IdType,
    adminPayload: UserPayload,
    accountId: IdType,
  ): Promise<void> {
    const accountUser =
      await this.accountUserRepository.getAccountUserWithUserByAccountIdAndUserId(
        accountId,
        userId,
      );
    if (!accountUser) {
      throw new NotFoundException('User not found.');
    }

    if (accountUser.account.owner.id == userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.accountUserRepository.remove([accountUser]);
    await this.invitationRepository.removeInvitationByInvitationUserAndAccountId(
      accountUser.user.email,
      accountId,
    );
    await this.mailingQueue.add(QueueEventEnum.SendEmailUserHasBeenDeleted, {
      userId: accountUser.user.id,
      adminId: adminPayload.id,
    });

    this.eventBus.publish(new RefreshFolderTreeEvent({ accountId }));
  }

  /**
   * Retrieves a paginated list of users and invitations associated with a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {GetPaginatedAccountUsersRequest} options - Pagination and filtering options for the request.
   * @return {Promise<PaginatedUsersAccountResponse>} A promise that resolves to a paginated response containing users and invitations.
   */
  async getAccountUsersAndInvitations(
    accountId: IdType,
    options: GetPaginatedAccountUsersRequest,
  ): Promise<PaginatedUsersAccountResponse> {
    const { items, meta } =
      await this.accountRepository.paginateAccountUsersInvitations(
        accountId,
        options,
      );

    return this.usersInvitationsAccountFactory.createResponse(items, { meta });
  }

  /**
   * Adds a user to an account with a specified role.
   *
   * @param {UserEntity} user - The user to be added to the account.
   * @param {AccountEntity} account - The target account where the user should be added.
   * @param {RoleEntity} role - The role of the user within the account.
   * @param {boolean} [byDefault=false] - Flag to determine if the user is added by default.
   * @return {Promise<void>} - A promise that resolves once the user has been added to the account.
   */
  async addUserToAccount(
    user: UserEntity,
    account: AccountEntity,
    role: RoleEntity,
    byDefault: boolean = false,
  ): Promise<void> {
    await this.accountUserRepository.save({ user, account, role, byDefault });
  }

  /**
   * Completes the account deletion process by performing the following actions:
   * 1. Retrieves accounts that need to be deleted.
   * 2. Extracts account IDs and user IDs from these accounts.
   * 3. Deletes the accounts and users associated with the retrieved IDs.
   * 4. Sends notification emails about the account deletion.
   *
   * @return {Promise<void>} A promise that resolves when the account deletion process is complete.
   */
  async completeAccountDeletion(): Promise<void> {
    const accounts = await this.accountRepository.getAccountsToDelete();
    for (const item of accounts) {
      this.eventBus.publish(
        new CompleteAccountDeletionEvent({
          remoteAccountUser: item,
        }),
      );
    }
  }

  /**
   * Sends notification emails to users whose accounts are about to be deleted.
   *
   * This method retrieves a list of accounts that are scheduled for deletion
   * and sends out notification emails to inform the respective users.
   *
   * @return {Promise<void>} A promise that resolves when the emails have been successfully sent.
   */
  async sendingEmailsAboutDeletingAnAccount(): Promise<void> {
    const accounts =
      await this.accountRepository.getAccountsThatAreAboutToExpireForDeletion();
    await this.mailingService.sendManyEmailsAboutDeletingAccount(accounts);
  }

  /**
   * Cancels the deletion of a user account, making it active again.
   *
   * @param {UserPayload} user - The payload containing the user's information.
   * @param {IdType} accountId - The unique identifier of the account to cancel deletion for.
   * @return {Promise<void>} A promise that resolves when the account deletion is canceled.
   * @throws {BadRequestException} If the account is not in the deletion phase.
   * @throws {ForbiddenException} If the user does not have permission to cancel deletion of the account.
   */
  async cancelAccountDeletion(
    user: UserPayload,
    accountId: IdType,
  ): Promise<void> {
    const userAccount = await this.accountRepository.getAccountById(accountId);
    if (!userAccount.deletedAt) {
      throw new BadRequestException('Account is not in the deletion phase.');
    }
    if (userAccount.owner.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    await this.accountRepository.save({ id: userAccount.id, deletedAt: null });
  }

  /**
   * Saves the company logo by uploading it to the storage service.
   *
   * @param {Express.Multer.File} logo - The file object containing the company logo,
   * which includes its buffer and original name.
   * @return {Promise<object>} A promise that resolves to the uploaded image information if successful.
   */
  private async saveCompanyLogo(logo: Express.Multer.File) {
    const stream = bufferToStream(logo.buffer);
    const image = await this.storageService.upload({
      fileName: logo.originalname,
      storagePath: BucketStoragePathsEnum.accountLogo,
      fileStream: stream,
    });

    runOnTransactionRollback(async () => {
      if (image) {
        await this.storageService.remove(image);
      }
    });
    return image;
  }

  /**
   * Changes the branding details of a user account based on the provided payload.
   *
   * @param {ChangeAccountBrandingType} changeAccountBrandingPayload - The payload containing new branding details.
   * @return {Promise<object>} A promise that resolves to an object containing updated account details and additional information.
   */
  @Transactional()
  async changeAccountBranding(
    changeAccountBrandingPayload: ChangeAccountBrandingType,
  ) {
    const userAccount = await this.getExistingUserAccount(
      changeAccountBrandingPayload.user.id,
      changeAccountBrandingPayload.accountId,
    );
    let emailReports = userAccount.emailReports;
    if (changeAccountBrandingPayload.emailReports) {
      emailReports =
        changeAccountBrandingPayload.emailReports === BooleanEnum.TRUE;
    }
    let sharedLinks = userAccount.sharedLinks;
    if (changeAccountBrandingPayload.sharedLinks) {
      sharedLinks =
        changeAccountBrandingPayload.sharedLinks === BooleanEnum.TRUE;
    }
    let validatedBySerpnest = userAccount.validatedBySerpnest;
    if (changeAccountBrandingPayload.validatedBySerpnest) {
      validatedBySerpnest =
        changeAccountBrandingPayload.validatedBySerpnest === BooleanEnum.TRUE;
    }
    let updateUserAccount;
    let companyLogoUrl;

    if (changeAccountBrandingPayload.companyLogo) {
      const imageStorageItem =
        (changeAccountBrandingPayload.companyLogo as unknown) !== ''
          ? await this.saveCompanyLogo(changeAccountBrandingPayload.companyLogo)
          : null;
      updateUserAccount = await this.accountRepository.save({
        id: userAccount.id,
        companyName:
          changeAccountBrandingPayload.companyName ?? userAccount.companyName,
        companyUrl:
          changeAccountBrandingPayload.companyUrl ?? userAccount.companyUrl,
        tagline: changeAccountBrandingPayload.tagline ?? userAccount.tagline,
        companyLogo: imageStorageItem,
        twitterLink:
          changeAccountBrandingPayload.twitterLink ?? userAccount.twitterLink,
        facebookLink:
          changeAccountBrandingPayload.facebookLink ?? userAccount.facebookLink,
        linkedinLink:
          changeAccountBrandingPayload.linkedinLink ?? userAccount.linkedinLink,
        emailReports,
        sharedLinks,
        validatedBySerpnest,
      });
      companyLogoUrl = await this.storageService.getStorageItemUrl(
        updateUserAccount.companyLogo,
      );
    } else {
      updateUserAccount = await this.accountRepository.save({
        id: userAccount.id,
        companyName:
          changeAccountBrandingPayload.companyName ?? userAccount.companyName,
        companyUrl:
          changeAccountBrandingPayload.companyUrl ?? userAccount.companyUrl,
        tagline: changeAccountBrandingPayload.tagline ?? userAccount.tagline,
        twitterLink:
          changeAccountBrandingPayload.twitterLink ?? userAccount.twitterLink,
        facebookLink:
          changeAccountBrandingPayload.facebookLink ?? userAccount.facebookLink,
        linkedinLink:
          changeAccountBrandingPayload.linkedinLink ?? userAccount.linkedinLink,
        emailReports,
        sharedLinks,
        validatedBySerpnest,
      });
      companyLogoUrl = await this.storageService.getStorageItemUrl(
        userAccount.companyLogo,
      );
    }

    const folderTree = await this.foldersService.accessAvailableFolderTree(
      changeAccountBrandingPayload.user.id,
    );

    return this.currentResponseFactory.createResponse(
      {
        ...updateUserAccount,
        owner: userAccount.owner,
        country: userAccount.country,
        timezone: userAccount.timezone,
      },
      {
        companyLogoUrl,
        folderTree,
      },
    );
  }

  /**
   * Deletes a user account based on the provided payload. It performs several
   * checks to ensure the user has the necessary permissions and that the account
   * is eligible for deletion. Upon successful validation, it cleans up related
   * data and sends notifications regarding the account deletion.
   *
   * @param {DeleteAccountType} payload - The details required to delete the account,
   * including user ID, account ID, and reason for deletion.
   * @return {Promise<DeleteAccountResponse>} - A promise that resolves with a
   * DeleteAccountResponse object, containing the date when the account will be
   * permanently deleted.
   * @throws {BadRequestException} - If the account has already been marked for deletion
   * or if there is an active subscription that needs to be canceled.
   * @throws {ForbiddenException} - If the user making the request does not have
   * the proper permissions to delete the account.
   */
  @Transactional()
  async deleteAccount(
    payload: DeleteAccountType,
  ): Promise<DeleteAccountResponse> {
    const userAccount = await this.getExistingUserAccount(
      payload.user.id,
      payload.accountId,
    );

    if (userAccount.deletedAt !== null) {
      throw new BadRequestException(
        'A request to delete the account has already been sent.',
      );
    }

    if (userAccount.owner.id !== payload.user.id) {
      throw new ForbiddenException('Access denied');
    }
    if (
      userAccount.subscription.status.name ===
        SubscriptionStatusesEnum.activated &&
      userAccount.subscription.tariffPlanSetting.tariffPlan.name !==
        TariffPlansEnum.TrialPeriod
    ) {
      throw new BadRequestException('cancel active subscription');
    }
    await this.accountRepository.softRemove(userAccount);
    await this.reasonsForAccountDeletionRepository.save({
      accountId: userAccount.id,
      reason: payload.reason,
    });
    await this.mailingQueue.add(
      QueueEventEnum.SendAnEmailAboutDeletingAccount,
      { userId: userAccount.owner.id },
    );
    const deletedAt = moment().add(30, 'days').format('MMM, D YYYY');
    await this.eventBus.publish(
      new UnsubscriptionEvent({
        accountId: payload.accountId,
        typeOfReason: TypesOfReasonsForUnsubscriptionEnum.other,
        reason: payload.reason,
      }),
    );
    return new DeleteAccountResponse({ deletedAt });
  }

  /**
   * Changes the password for a user.
   *
   * @param {ChangePasswordType} payload - The payload containing information needed to change the password.
   * @param {string} payload.user.id - The ID of the user whose password needs to be changed.
   * @param {string} [payload.currentPassword] - The current password of the user. Only required if the current password check should be performed.
   * @param {string} payload.newPassword - The new password to set for the user.
   * @return {Promise<void>} A promise that resolves when the password change is complete.
   * @throws {BadRequestException} If the current password is provided and does not match the user's existing password.
   */
  async changePassword(payload: ChangePasswordType): Promise<void> {
    const user = await this.userRepository.getUser(payload.user.id);
    if (payload.currentPassword) {
      const passwordMatched = await this.cryptoUtilService.verifyPasswordHash(
        payload.currentPassword,
        user.password,
      );
      if (!passwordMatched) {
        throw new BadRequestException('Incorrect password provided');
      }
    }

    user.password = await this.cryptoUtilService.generatePasswordHash(
      payload.newPassword,
    );
    user.passwordResetConfirmationToken = null;
    user.isEmailConfirmed = true;
    await this.userRepository.save(user);
  }

  /**
   * Retrieves existing user accounts based on the provided user ID and account IDs.
   *
   * @param {IdType} userId - The ID of the user for whom the accounts are being fetched.
   * @param {IdType[]} accountIds - An array of account IDs to be fetched for the user.
   * @return {Promise<AccountUserEntity[]>} A promise that resolves to an array of AccountUserEntity objects.
   * @throws {NotFoundException} If no accounts are found for the provided user ID and account IDs.
   */
  async getExistingUserAccounts(
    userId: IdType,
    accountIds: IdType[],
  ): Promise<AccountUserEntity[]> {
    const userAccounts =
      await this.accountUserRepository.getAccountsByUserIdAndAccountIds(
        userId,
        accountIds,
      );
    if (!userAccounts && userAccounts.length === 0) {
      throw new NotFoundException('Accounts not found.');
    }
    return userAccounts;
  }

  /**
   * Fetches an existing user account along with its related counts.
   *
   * @param {IdType} userId - The ID of the user.
   * @param {IdType} accountId - The ID of the account.
   * @return {Promise<AccountEntity & { usersCount: number, projectsCount: number, invitationsCount: number }>}
   *         A promise that resolves to an object containing account details along with users count, projects count, and invitations count.
   * @throws {NotFoundException} If the account or the account info is not found.
   */
  async getExistingUserAccount(
    userId: IdType,
    accountId: IdType,
  ): Promise<
    AccountEntity & {
      usersCount: number;
      projectsCount: number;
      invitationsCount: number;
    }
  > {
    const userAccount = await this.accountUserRepository.getUserAccount(
      userId,
      accountId,
    );
    if (!userAccount) {
      throw new NotFoundException('Account not found');
    }
    const userAccountInfo = await this.accountUserRepository.getUserAccountInfo(
      userId,
      accountId,
    );
    if (!userAccountInfo) {
      throw new NotFoundException('Account info not found');
    }

    return {
      ...userAccount.account,
      usersCount: userAccountInfo.users_count,
      projectsCount: userAccountInfo.projects_count,
      invitationsCount: userAccountInfo.invitations_count,
    };
  }

  /**
   * Change the account settings based on the provided payload.
   *
   * @param {ChangeAccountSettingsType} payload - The payload containing the new settings for the account.
   * @return {Promise<CurrentAccountResponse>} The updated account response containing the new settings and changes.
   * @throws {ForbiddenException} If the user does not have permission to change account settings.
   * @throws {BadRequestException} If the current password is provided without a new password.
   */
  @Transactional()
  async changeAccountSettings(
    payload: ChangeAccountSettingsType,
  ): Promise<CurrentAccountResponse> {
    const userAccount = await this.getExistingUserAccount(
      payload.user.id,
      payload.accountId,
    );

    const country = await this.countriesService.getExistingCountry(
      payload.countryId,
    );
    const timezone = await this.timezoneService.getExistingTimezone(
      payload.timezoneId,
    );

    if (payload.firstName || payload.lastName) {
      if (userAccount.owner.id !== payload.user.id) {
        throw new ForbiddenException('Access denied');
      }
      if (
        userAccount.owner.lastName !== payload.lastName ||
        userAccount.owner.firstName !== payload.firstName
      ) {
        await this.userRepository.save({
          id: userAccount.owner.id,
          firstName: payload.firstName,
          lastName: payload.lastName,
          username: `${payload.firstName} ${payload.lastName}`,
        });
      }
    }

    if (payload.currentPassword && !payload.newPassword) {
      throw new BadRequestException('Enter a new password');
    }
    if (payload.currentPassword && payload.newPassword) {
      if (userAccount.owner.id !== payload.user.id) {
        throw new ForbiddenException('Access denied');
      }
      await this.changePassword({
        user: payload.user,
        newPassword: payload.newPassword,
        currentPassword: payload.currentPassword,
      });
    } else if (!payload.currentPassword && payload.newPassword) {
      await this.changePassword({
        user: payload.user,
        newPassword: payload.newPassword,
        currentPassword: null,
      });
    }

    await this.accountRepository.save({
      id: userAccount.id,
      country,
      timezone,
    });
    const updateUserAccount = await this.getExistingUserAccount(
      payload.user.id,
      payload.accountId,
    );
    const folderTree = await this.foldersService.accessAvailableFolderTree(
      payload.user.id,
    );
    const companyLogoUrl = updateUserAccount?.companyLogo
      ? await this.storageService.getStorageItemUrl(userAccount.companyLogo)
      : null;
    const account = await this.accountRepository.getAccountById(
      payload.accountId,
    );
    const userResponse = await this.userFactory.createResponse(account.owner);
    await this.gatewayService.handleUserResponse(userResponse);
    return this.currentResponseFactory.createResponse(updateUserAccount, {
      companyLogoUrl,
      folderTree,
    });
  }

  /**
   * Retrieve the current limits for a given account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @param {IdType} userId - The unique identifier for the user.
   * @return {Promise<CurrentAccountLimitResponse>} - A promise that resolves to the current account limits response.
   */
  async getCurrentAccountLimits(
    accountId: IdType,
    userId: IdType,
  ): Promise<CurrentAccountLimitResponse> {
    const limits = await this.accountLimitsService.getAllLimitsOfCurrentAccount(
      accountId,
      userId,
    );
    return this.currentAccountLimitsResponseFactory.createResponse(limits, {
      accountId,
    });
  }

  /**
   * Retrieves the current account details for the specified account ID and user.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {UserPayload} user - The payload containing user information.
   * @return {Promise<CurrentAccountResponse>} A promise that resolves to the current account response details.
   */
  async getCurrentAccount(
    accountId: IdType,
    user: UserPayload,
  ): Promise<CurrentAccountResponse> {
    const userAccount = await this.getExistingUserAccount(user.id, accountId);
    const folderTree = await this.foldersService.getFoldersTree(
      accountId,
      user.id,
    );

    const companyLogoUrl = userAccount.companyLogo
      ? await this.storageService.getStorageItemUrl(userAccount.companyLogo)
      : null;
    return this.currentResponseFactory.createResponse(userAccount, {
      companyLogoUrl,
      folderTree,
    });
  }

  /**
   * Creates a new account based on the provided payload information.
   * This method fetches and assigns country, timezone, role, and tariff plan details before saving the account.
   *
   * @param {CreateAccountType} payload - The data required to create the account including countryId, timezoneId, tariffPlan, and owner.
   * @return {Promise<void>} - A promise that resolves when the account has been successfully created and all related operations have been completed.
   */
  async createAccount(payload: CreateAccountType): Promise<void> {
    const country = payload.countryId
      ? await this.countriesService.getExistingCountry(payload.countryId)
      : await this.countriesService.getCountry('Australia');
    const timezone = payload.timezoneId
      ? await this.timezoneService.getExistingTimezone(payload.timezoneId)
      : await this.timezoneService.getTimezone(
          '(GMT+08:00) Kuching, Kota Kinabalu, Sandakan, Tawau, Miri',
        );
    const role = await this.roleRepository.getRoleByName(RoleEnum.Admin);

    const preferredTariffPlan = payload.tariffPlan
      ? await this.tariffPlanSettingRepository.getTariffPlanById(
          payload.tariffPlan,
        )
      : null;
    const account = await this.accountRepository.save({
      ...payload,
      country,
      timezone,
      preferredTariffPlan,
    });
    await this.saveApiKey(account);
    await this.foldersService.creatingMasterAccountFolder({
      account,
      user: payload.owner,
    });
    await this.addUserToAccount(payload.owner, account, role, true);
  }

  /**
   * Saves the API key for the given account entity.
   *
   * @param {AccountEntity} account - The account entity for which the API key is to be saved.
   * @return {Promise<AccountEntity>} - A promise that resolves to the updated account entity containing the saved API key.
   */
  async saveApiKey(account: AccountEntity): Promise<AccountEntity> {
    const apiKey = await this.generateApiKey(account);
    return this.accountRepository.save({ ...account, apiKey });
  }

  /**
   * Generates an API key for a given account.
   *
   * @param {AccountEntity} account - The account entity for which the API key is being generated.
   * @return {Promise<string>} A promise that resolves to the generated API key.
   */
  async generateApiKey(account: AccountEntity): Promise<string> {
    const payload: SerpnestApiKeyData['account'] = {
      accountId: account.id,
    };
    return this.jwtService.signAsync(
      {
        account: payload,
      },
      {
        secret: this.configService.get(ConfigEnvEnum.SERPNEST_JWT_SECRET_KEY),
        subject: account.id.toString(),
      },
    );
  }
}
