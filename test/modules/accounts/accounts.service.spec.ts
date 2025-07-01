import { AccountsService } from 'modules/accounts/services/accounts.service';
import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AccountRepository } from 'modules/accounts/repositories/account.repository';
import { CountriesService } from 'modules/countries/services/countries.service';
import { TimezonesService } from 'modules/timezones/services/timezones.service';
import { JwtService } from '@nestjs/jwt';
import { getQueueToken } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { CurrentResponseFactory } from 'modules/accounts/factories/current-response.factory';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { StorageService } from 'modules/storage/services/storage.service';
import { ReasonsForAccountDeletionRepository } from 'modules/accounts/repositories/reasons-for-account-deletion.repository';
import { MailingService } from 'modules/mailing/services/mailing.service';
import { AccountUserRepository } from 'modules/accounts/repositories/account-user.repository';
import { UsersInvitationsAccountFactory } from 'modules/users/factories/users-invitations-account.factory';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { FoldersService } from 'modules/folders/services/folders.service';
import { AccountSearchResponseFactory } from 'modules/accounts/factories/account-search-response.factory';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { TariffPlanSettingRepository } from 'modules/subscriptions/repositories/tariff-plan-setting.repository';
import { UserSearchesService } from 'modules/users/services/user-searches.service';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { CurrentAccountLimitsResponseFactory } from 'modules/accounts/factories/current-account-limits-response.factory';
import { TariffPlansService } from 'modules/subscriptions/services/tariff-plans.service';
import { NecessaryRemovalResponseFactory } from 'modules/accounts/factories/necessary-removal-response.factory';
import { GatewayService } from 'modules/gateway/services/gateway.service';
import { UserFactory } from 'modules/users/factories/user.factory';
import { UpdateAccountUserType } from 'modules/users/types/update-account-user.type';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { userEntityMock } from '../../mocks/entities/user-entity.mock';
import { accountEntityMock } from '../../mocks/entities/account-entity.mock';
import { roleAdminEntityMock } from '../../mocks/entities/role-entity.mock';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { AccountSearchRequest } from 'modules/accounts/requests/account-search.request';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { CustomerUpgradeEvent } from 'modules/subscriptions/events/customer-upgrade.event';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { BooleanEnum } from 'modules/common/enums/boolean.enum';
import { storageItemCompanyLogoMock } from '../../mocks/entities/storage-item-entity.mock';
import { TypesOfReasonsForUnsubscriptionEnum } from 'modules/subscriptions/enums/types-of-reasons-for-unsubscription.enum';
import { SubscriptionStatusesEnum } from 'modules/subscriptions/enums/subscription-statuses.enum';
import { TariffPlansEnum } from 'modules/subscriptions/enums/tariff-plans.enum';
import moment from 'moment';
import { ChangeAccountSettingsType } from 'modules/accounts/types/change-account-settings.type';
import { CreateAccountType } from 'modules/accounts/types/create-account.type';

jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

describe('AccountsService', () => {
  let accountsService: AccountsService;
  let accountUserRepository: AccountUserRepository;
  let roleRepository: RoleRepository;
  let accountLimitsService: AccountLimitsService;
  let tariffPlansService: TariffPlansService;
  let necessaryRemovalResponseFactory: NecessaryRemovalResponseFactory;
  let accountRepository: AccountRepository;
  let userSearchesService: UserSearchesService;
  let accountSearchResponseFactory: AccountSearchResponseFactory;
  let userRepository: UserRepository;
  let mailingQueue: Queue;
  let eventBus: EventBus;
  let cryptoUtilService: CryptoUtilsService;
  let invitationRepository: InvitationRepository;
  let storageService: StorageService;
  let foldersService: FoldersService;
  let currentResponseFactory: CurrentResponseFactory;
  let reasonsForAccountDeletionRepository: ReasonsForAccountDeletionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: AccountRepository,
          useValue: {
            getAccountById: jest.fn(),
            searchByAccount: jest.fn(),
            softRemove: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: CountriesService,
          useValue: {
            getExistingCountry: jest.fn(),
            getCountry: jest.fn(),
          },
        },
        {
          provide: TimezonesService,
          useValue: {
            getExistingTimezone: jest.fn(),
            getTimezone: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: getQueueToken(Queues.Mailing),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: CurrentResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getUserByEmail: jest.fn(),
            getUserByGoogleId: jest.fn(),
            getUserByEmailConfirmationToken: jest.fn(),
            save: jest.fn(),
            getUserById: jest.fn(),
          },
        },
        {
          provide: CryptoUtilsService,
          useValue: {
            generatePasswordHash: jest.fn(),
            generateUUID: jest.fn(),
            verifyPasswordHash: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            upload: jest.fn(),
            remove: jest.fn(),
            getStorageItemUrl: jest.fn(),
          },
        },
        {
          provide: ReasonsForAccountDeletionRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: MailingService,
          useValue: {
            sendManyEmailsAboutDeletingAccount: jest.fn(),
          },
        },
        {
          provide: AccountUserRepository,
          useValue: {
            save: jest.fn(),
            remove: jest.fn(),
            getAccountUserWithRole: jest.fn(),
            getIdsOfAccountUserFolders: jest.fn(),
            getIdsOfAccountUserProjects: jest.fn(),
            removeLinkBetweenFoldersAndUser: jest.fn(),
            removeLinkBetweenProjectsAndUser: jest.fn(),
            addALinkBetweenFoldersAndUser: jest.fn(),
            addALinkBetweenProjectsAndUser: jest.fn(),
            getAccountUserWithUserByAccountIdAndUserId: jest.fn(),
            getUserAccountByDefault: jest.fn(),
            getAnAccountByOwnerId: jest.fn(),
            getAccountUsersWithUserByAccountIdAndUserIds: jest.fn(),
          },
        },
        {
          provide: UsersInvitationsAccountFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            getRoleByName: jest.fn(),
          },
        },
        {
          provide: InvitationRepository,
          useValue: {
            removeInvitationByInvitationUserAndAccountId: jest.fn(),
            removeInvitationsByInvitationUsersAndAccountId: jest.fn(),
          },
        },
        {
          provide: FoldersService,
          useValue: {
            accessAvailableFolderTree: jest.fn(),
            creatingMasterAccountFolder: jest.fn(),
          },
        },
        {
          provide: AccountSearchResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EventBus,
          useValue: {
            setModuleRef: jest.fn(),
            register: jest.fn(),
            publish: jest.fn(),
          },
        },
        {
          provide: TariffPlanSettingRepository,
          useValue: {
            getTariffPlanById: jest.fn(),
          },
        },
        {
          provide: UserSearchesService,
          useValue: { getLatestCustomSearchResults: jest.fn() },
        },
        {
          provide: AccountLimitsService,
          useValue: {
            getAllLimitsOfCurrentAccount: jest.fn(),
            accountingOfUsers: jest.fn(),
          },
        },
        {
          provide: CurrentAccountLimitsResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: TariffPlansService,
          useValue: {
            getTariffPlanSettingWithLimits: jest.fn(),
          },
        },
        {
          provide: NecessaryRemovalResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: GatewayService,
          useValue: {
            handleUserResponse: jest.fn(),
          },
        },
        {
          provide: UserFactory,
          useValue: { createResponse: jest.fn() },
        },
      ],
    }).compile();

    accountsService = module.get<AccountsService>(AccountsService);
    accountUserRepository = module.get<AccountUserRepository>(
      AccountUserRepository,
    );
    roleRepository = module.get<RoleRepository>(RoleRepository);
    accountLimitsService =
      module.get<AccountLimitsService>(AccountLimitsService);
    tariffPlansService = module.get<TariffPlansService>(TariffPlansService);
    necessaryRemovalResponseFactory =
      module.get<NecessaryRemovalResponseFactory>(
        NecessaryRemovalResponseFactory,
      );
    accountRepository = module.get<AccountRepository>(AccountRepository);
    userSearchesService = module.get<UserSearchesService>(UserSearchesService);
    accountSearchResponseFactory = module.get<AccountSearchResponseFactory>(
      AccountSearchResponseFactory,
    );
    userRepository = module.get(UserRepository);
    cryptoUtilService = module.get(CryptoUtilsService);
    eventBus = module.get<EventBus>(EventBus);
    mailingQueue = module.get<Queue>(getQueueToken(Queues.Mailing));
    invitationRepository =
      module.get<InvitationRepository>(InvitationRepository);
    storageService = module.get<StorageService>(StorageService);
    foldersService = module.get<FoldersService>(FoldersService);
    currentResponseFactory = module.get<CurrentResponseFactory>(
      CurrentResponseFactory,
    );
    reasonsForAccountDeletionRepository =
      module.get<ReasonsForAccountDeletionRepository>(
        ReasonsForAccountDeletionRepository,
      );
  });

  it('should be defined', () => {
    expect(accountsService).toBeDefined();
  });

  describe('updateAccountUser', () => {
    const payload: UpdateAccountUserType = {
      accountId: accountEntityMock.id,
      userId: userEntityMock.id,
      folderIds: null,
      projectIds: null,
    };
    const accountUserMock = {
      id: 1,
      user: { ...userEntityMock },
      account: { ...accountEntityMock },
      role: { ...roleAdminEntityMock },
      byDefault: true,
    };

    it('should throw NotFoundException if account user is not found', async () => {
      jest
        .spyOn(accountUserRepository, 'getAccountUserWithRole')
        .mockResolvedValue(null);

      await expect(accountsService.updateAccountUser(payload)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should update role if roleName is provided', async () => {
      jest
        .spyOn(accountUserRepository, 'getAccountUserWithRole')
        .mockResolvedValue({ ...accountUserMock } as any);
      jest
        .spyOn(roleRepository, 'getRoleByName')
        .mockResolvedValue(roleAdminEntityMock);

      await accountsService.updateAccountUser({
        ...payload,
        roleName: RoleEnum.Admin,
      });

      expect(roleRepository.getRoleByName).toHaveBeenCalledWith(RoleEnum.Admin);
      expect(accountUserRepository.save).toHaveBeenCalledWith({
        id: accountUserMock.id,
        role: roleAdminEntityMock,
      });
    });
    it('should update folders if folderIds are provided', async () => {
      const currentFolders = [1, 2, 3];
      const payloadFolderIds = [2, 4];

      jest
        .spyOn(accountUserRepository, 'getAccountUserWithRole')
        .mockResolvedValue({ ...accountUserMock } as any);
      jest
        .spyOn(accountUserRepository, 'getIdsOfAccountUserFolders')
        .mockResolvedValue(currentFolders);

      await accountsService.updateAccountUser({
        ...payload,
        folderIds: payloadFolderIds,
      });

      expect(
        accountUserRepository.removeLinkBetweenFoldersAndUser,
      ).toHaveBeenCalledWith(userEntityMock.id, [1, 3]);
      expect(
        accountUserRepository.addALinkBetweenFoldersAndUser,
      ).toHaveBeenCalledWith(userEntityMock.id, [4]);
    });
    it('should update projects if projectIds are provided', async () => {
      const currentProjects = [5, 6, 7];
      const payloadProjectIds = [6, 8];

      jest
        .spyOn(accountUserRepository, 'getAccountUserWithRole')
        .mockResolvedValue({
          ...accountUserMock,
        } as any);
      jest
        .spyOn(accountUserRepository, 'getIdsOfAccountUserProjects')
        .mockResolvedValue(currentProjects);

      await accountsService.updateAccountUser({
        ...payload,
        projectIds: payloadProjectIds,
      });

      expect(
        accountUserRepository.removeLinkBetweenProjectsAndUser,
      ).toHaveBeenCalledWith(userEntityMock.id, [5, 7]);
      expect(
        accountUserRepository.addALinkBetweenProjectsAndUser,
      ).toHaveBeenCalledWith(userEntityMock.id, [8]);
    });
  });
  //
  describe('necessaryRemoval', () => {
    it('should call getAllLimitsOfCurrentAccount and getTariffPlanSettingWithLimits', async () => {
      const accountId = 1;
      const paddleProductId = 'prod_123';
      const userId = 2;

      const mockCurrentLimits = { limit: 100 };
      const mockPlanLimits = { limit: 200 };
      const mockResponse = { necessaryRemovals: ['item1', 'item2'] };

      jest
        .spyOn(accountLimitsService, 'getAllLimitsOfCurrentAccount')
        .mockResolvedValue(mockCurrentLimits as any);
      jest
        .spyOn(tariffPlansService, 'getTariffPlanSettingWithLimits')
        .mockResolvedValue(mockPlanLimits as any);
      jest
        .spyOn(necessaryRemovalResponseFactory, 'createResponse')
        .mockReturnValue(mockResponse as any);

      const result = await accountsService.necessaryRemoval(
        accountId,
        paddleProductId,
        userId,
      );

      expect(
        accountLimitsService.getAllLimitsOfCurrentAccount,
      ).toHaveBeenCalledWith(accountId, userId);
      expect(
        tariffPlansService.getTariffPlanSettingWithLimits,
      ).toHaveBeenCalledWith(paddleProductId);
      expect(
        necessaryRemovalResponseFactory.createResponse,
      ).toHaveBeenCalledWith(mockCurrentLimits, {
        planLimits: mockPlanLimits,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return a response from createResponse with proper arguments', async () => {
      const accountId = 1;
      const paddleProductId = 'prod_123';
      const userId = 2;

      const mockCurrentLimits = { limit: 100 };
      const mockPlanLimits = { limit: 150 };
      // @ts-ignore
      const expectedResponse = { necessaryRemovals: [] };

      jest
        .spyOn(accountLimitsService, 'getAllLimitsOfCurrentAccount')
        .mockResolvedValue(mockCurrentLimits as any);
      jest
        .spyOn(tariffPlansService, 'getTariffPlanSettingWithLimits')
        .mockResolvedValue(mockPlanLimits as any);
      jest
        .spyOn(necessaryRemovalResponseFactory, 'createResponse')
        .mockReturnValue(expectedResponse as any);

      const result = await accountsService.necessaryRemoval(
        accountId,
        paddleProductId,
        userId,
      );

      expect(result).toEqual(expectedResponse);
    });
  });
  //
  describe('search', () => {
    const accountId = accountEntityMock.id;
    const user = {
      id: userEntityMock.id,
      accounts: [{ id: accountEntityMock.id, role: roleAdminEntityMock }],
    };

    it('should not call searchByAccount if search term length is 3 or less', async () => {
      // @ts-ignore
      const options: AccountSearchRequest = { search: 'abc' };

      const mockRecentlyViewed = [
        { id: 3, name: 'Another Recently Viewed Account' },
      ];
      // @ts-ignore
      const mockResponse = { data: [] };

      jest
        .spyOn(userSearchesService, 'getLatestCustomSearchResults')
        .mockResolvedValue(mockRecentlyViewed as any);
      jest
        .spyOn(accountSearchResponseFactory, 'createResponse')
        .mockReturnValue(mockResponse as any);

      const result = await accountsService.search(accountId, user, options);

      expect(accountRepository.searchByAccount).not.toHaveBeenCalled();
      expect(
        userSearchesService.getLatestCustomSearchResults,
      ).toHaveBeenCalledWith(user.id);
      expect(accountSearchResponseFactory.createResponse).toHaveBeenCalledWith(
        [],
        {
          ...options,
          recentlyViewed: mockRecentlyViewed,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return the response from createResponse with proper arguments', async () => {
      // @ts-ignore
      const options: AccountSearchRequest = { search: 'example' };

      const mockSearchResult = [{ id: 1, name: 'Sample Account' }];
      const mockRecentlyViewed = [
        { id: 2, name: 'Another Recently Viewed Account' },
      ];
      const expectedResponse = { data: mockSearchResult };

      jest
        .spyOn(accountRepository, 'searchByAccount')
        .mockResolvedValue(mockSearchResult as any);
      jest
        .spyOn(userSearchesService, 'getLatestCustomSearchResults')
        .mockResolvedValue(mockRecentlyViewed as any);
      jest
        .spyOn(accountSearchResponseFactory, 'createResponse')
        .mockReturnValue(expectedResponse as any);

      const result = await accountsService.search(accountId, user, options);

      expect(result).toEqual(expectedResponse);
    });
  });
  //
  describe('emailChangeConfirmation', () => {
    const emailConfirmationToken = 'test-token';
    const newEmail = 'new@example.com';

    it('should throw NotFoundException if user is not found', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmailConfirmationToken')
        .mockResolvedValue(null);

      await expect(
        accountsService.emailChangeConfirmation({
          emailConfirmationToken,
          newEmail,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(
        userRepository.getUserByEmailConfirmationToken,
      ).toHaveBeenCalledWith(emailConfirmationToken);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should update user email, generate new emailConfirmationToken, and set isEmailConfirmed to false', async () => {
      const mockUser = {
        ...userEntityMock,
        emailConfirmationToken,
        isEmailConfirmed: true,
      };
      const newToken = 'new-uuid-token';

      jest
        .spyOn(userRepository, 'getUserByEmailConfirmationToken')
        .mockResolvedValue(mockUser);
      jest.spyOn(cryptoUtilService, 'generateUUID').mockReturnValue(newToken);

      await accountsService.emailChangeConfirmation({
        emailConfirmationToken,
        newEmail,
      });

      expect(
        userRepository.getUserByEmailConfirmationToken,
      ).toHaveBeenCalledWith(emailConfirmationToken);
      expect(cryptoUtilService.generateUUID).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        email: newEmail,
        emailConfirmationToken: newToken,
        isEmailConfirmed: false,
      });
    });

    it('should add messages to the mailingQueue and publish a CustomerUpgradeEvent', async () => {
      const mockUser = {
        ...userEntityMock,
        isEmailConfirmed: true,
        emailConfirmationToken,
      };

      jest
        .spyOn(userRepository, 'getUserByEmailConfirmationToken')
        .mockResolvedValue(mockUser);

      await accountsService.emailChangeConfirmation({
        emailConfirmationToken,
        newEmail,
      });

      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendAnEmailAboutSuccessfulEmailChange,
        { oldEmail: userEntityMock.email, userId: userEntityMock.id },
      );
      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendAnEmailToConfirmNewEmail,
        { userId: userEntityMock.id },
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new CustomerUpgradeEvent({ userId: userEntityMock.id, newEmail }),
      );
    });
  });
  //
  describe('changeAccountEmail', () => {
    const mockUser = {
      id: userEntityMock.id,
      accounts: [{ id: accountEntityMock.id, role: roleAdminEntityMock }],
    };
    const payload = {
      accountId: accountEntityMock.id,
      user: { ...mockUser },
      newEmail: 'new@example.com',
      currentEmail: userEntityMock.email,
      confirmationPassword: 'password123',
    };

    it('should throw ForbiddenException if the user is not the owner of the account', async () => {
      const mockUserAccount = {
        account: { owner: { id: 3 } },
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);

      await expect(accountsService.changeAccountEmail(payload)).rejects.toThrow(
        ForbiddenException,
      );

      expect(
        accountUserRepository.getAccountUserWithUserByAccountIdAndUserId,
      ).toHaveBeenCalledWith(payload.accountId, payload.user.id);
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('should throw BadRequestException if the new email is already in use', async () => {
      const mockUserAccount = {
        account: {
          owner: { id: 2 },
        },
      };
      const mockExistingUser = { ...userEntityMock };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest
        .spyOn(cryptoUtilService, 'verifyPasswordHash')
        .mockResolvedValue(true);
      jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue(mockExistingUser);

      await expect(accountsService.changeAccountEmail(payload)).rejects.toThrow(
        BadRequestException,
      );

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        payload.newEmail,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('should update emailConfirmationToken and save user', async () => {
      const mockUserAccount = {
        account: {
          owner: userEntityMock,
        },
      };
      const newToken = 'new-uuid-token';

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest
        .spyOn(cryptoUtilService, 'verifyPasswordHash')
        .mockResolvedValue(true);
      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue(null);
      jest.spyOn(cryptoUtilService, 'generateUUID').mockReturnValue(newToken);

      await accountsService.changeAccountEmail(payload);

      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUserAccount.account.owner,
        emailConfirmationToken: newToken,
      });
      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendALetterToChangeEmail,
        {
          userId: mockUserAccount.account.owner.id,
          newEmail: 'new@example.com',
        },
      );
    });
  });
  //
  describe('deleteAdditionalAccount', () => {
    it('should throw NotFoundException if account is not found', async () => {
      const payload = { accountId: 1, user: { id: 2 } };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(null);

      await expect(
        accountsService.deleteAdditionalAccount(payload as any),
      ).rejects.toThrow(NotFoundException);

      expect(
        accountUserRepository.getAccountUserWithUserByAccountIdAndUserId,
      ).toHaveBeenCalledWith(payload.accountId, payload.user.id);
    });

    it('should throw ForbiddenException if user is the owner of the account', async () => {
      const payload = { accountId: 1, user: { id: 2 } };
      const mockUserAccount = {
        account: { owner: { id: 2 } },
        user: { email: 'user@example.com' },
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);

      await expect(
        accountsService.deleteAdditionalAccount(payload as any),
      ).rejects.toThrow(ForbiddenException);

      expect(
        accountUserRepository.getAccountUserWithUserByAccountIdAndUserId,
      ).toHaveBeenCalledWith(payload.accountId, payload.user.id);
    });

    it('should remove user account if conditions are met', async () => {
      const payload = { accountId: 1, user: { id: 2 } };
      const mockUserAccount = {
        account: { owner: { id: 3 } }, // Пользователь не является владельцем
        user: { email: 'user@example.com' },
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest
        .spyOn(accountUserRepository, 'getUserAccountByDefault')
        .mockResolvedValue(true as any);

      await accountsService.deleteAdditionalAccount(payload as any);

      expect(accountUserRepository.remove).toHaveBeenCalledWith(
        mockUserAccount,
      );
    });

    it('should remove invitation for user and account', async () => {
      const payload = { accountId: 1, user: { id: 2 } };
      const mockUserAccount = {
        account: { owner: { id: 3 } }, // Пользователь не является владельцем
        user: { email: 'user@example.com' },
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest
        .spyOn(accountUserRepository, 'getUserAccountByDefault')
        .mockResolvedValue(true as any);

      await accountsService.deleteAdditionalAccount(payload as any);

      expect(
        invitationRepository.removeInvitationByInvitationUserAndAccountId,
      ).toHaveBeenCalledWith(mockUserAccount.user.email, payload.accountId);
    });

    it('should set a new default account if no default account exists', async () => {
      const payload = { accountId: 1, user: { id: 2 } };
      const mockUserAccount = {
        account: { owner: { id: 3 } }, // Пользователь не является владельцем
        user: { email: 'user@example.com' },
      };
      const mockNewDefaultAccount = {
        id: 4,
        owner: { id: 2 },
        byDefault: false,
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest
        .spyOn(accountUserRepository, 'getUserAccountByDefault')
        .mockResolvedValue(null);
      jest
        .spyOn(accountUserRepository, 'getAnAccountByOwnerId')
        .mockResolvedValue(mockNewDefaultAccount as any);

      await accountsService.deleteAdditionalAccount(payload as any);

      expect(accountUserRepository.save).toHaveBeenCalledWith({
        ...mockNewDefaultAccount,
        byDefault: true,
      });
    });
  });
  //
  describe('changeUserAccount', () => {
    it('should throw NotFoundException if user account is not found', async () => {
      const payload = {
        accountId: 1,
        userId: 2,
        roleName: 'newRole',
        adminPayload: { id: 3 },
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(null);

      await expect(
        accountsService.changeUserAccount(payload as any),
      ).rejects.toThrow(NotFoundException);

      expect(
        accountUserRepository.getAccountUserWithUserByAccountIdAndUserId,
      ).toHaveBeenCalledWith(payload.accountId, payload.userId);
    });

    it('should throw BadRequestException if user is the owner of the account', async () => {
      const payload = {
        accountId: 1,
        userId: 2,
        roleName: 'newRole',
        adminPayload: { id: 3 },
      };
      const mockUserAccount = {
        account: { owner: { id: 2 } }, // is owner
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);

      await expect(
        accountsService.changeUserAccount(payload as any),
      ).rejects.toThrow(BadRequestException);

      expect(
        accountUserRepository.getAccountUserWithUserByAccountIdAndUserId,
      ).toHaveBeenCalledWith(payload.accountId, payload.userId);
    });

    it('should throw NotFoundException if role is not found', async () => {
      const payload = {
        accountId: 1,
        userId: 2,
        roleName: 'newRole',
        adminPayload: { id: 3 },
      };
      const mockUserAccount = {
        account: { owner: { id: 3 } }, // is not owner
      };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest.spyOn(roleRepository, 'getRoleByName').mockResolvedValue(null);

      await expect(
        accountsService.changeUserAccount(payload as any),
      ).rejects.toThrow(NotFoundException);

      expect(roleRepository.getRoleByName).toHaveBeenCalledWith(
        payload.roleName,
      );
    });

    it('should save the user account with the new role and add a notification to the mailing queue', async () => {
      const payload = {
        accountId: 1,
        userId: 2,
        roleName: 'newRole',
        adminPayload: { id: 3 },
      };
      const mockUserAccount = {
        account: { owner: { id: 3 } }, // is not owner
        role: { name: 'oldRole' },
      };
      const mockRole = { name: 'newRole' };

      jest
        .spyOn(
          accountUserRepository,
          'getAccountUserWithUserByAccountIdAndUserId',
        )
        .mockResolvedValue(mockUserAccount as any);
      jest
        .spyOn(roleRepository, 'getRoleByName')
        .mockResolvedValue(mockRole as any);

      await accountsService.changeUserAccount(payload as any);

      expect(accountUserRepository.save).toHaveBeenCalledWith({
        ...mockUserAccount,
        role: mockRole,
      });
      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendAccountPermissionChangeNotification,
        {
          accountId: payload.accountId,
          userId: payload.userId,
          roleName: payload.roleName,
          adminId: payload.adminPayload.id,
        },
      );
    });
  });
  //
  describe('accountsBulkDelete', () => {
    it('should throw ForbiddenException if user is the owner of any account', async () => {
      const accountIds = [1, 2];
      const userPayload = { id: 3 };
      const userAccounts = [
        { account: { id: 1, owner: { id: 3 } } }, // is owner
        { account: { id: 2, owner: { id: 4 } } },
      ];

      jest
        .spyOn(accountsService, 'getExistingUserAccounts')
        .mockResolvedValue(userAccounts as any);

      await expect(
        accountsService.accountsBulkDelete(accountIds, userPayload as any),
      ).rejects.toThrow(ForbiddenException);

      expect(accountsService.getExistingUserAccounts).toHaveBeenCalledWith(
        userPayload.id,
        accountIds,
      );
    });

    it('should remove user accounts if user is not the owner of any account', async () => {
      const accountIds = [1, 2];
      const userPayload = {
        id: userEntityMock.id,
        email: userEntityMock.email,
      };
      const userAccounts = [
        { account: { id: 1, owner: { id: 4 } } },
        { account: { id: 2, owner: { id: 5 } } },
      ];
      jest
        .spyOn(accountsService, 'getExistingUserAccounts')
        .mockResolvedValue(userAccounts as any);
      jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue({ ...userEntityMock });

      await accountsService.accountsBulkDelete(accountIds, userPayload as any);

      expect(accountUserRepository.remove).toHaveBeenCalledWith(userAccounts);
    });

    it('should remove invitations associated with each deleted account', async () => {
      const accountIds = [1, 2];
      const userPayload = { id: 3 };
      const userAccounts = [
        { account: { id: 1, owner: { id: 4 } } }, // is not owner
        { account: { id: 2, owner: { id: 5 } } },
      ];
      const mockUser = { id: 3, email: 'user@example.com' };

      jest
        .spyOn(accountsService, 'getExistingUserAccounts')
        .mockResolvedValue(userAccounts as any);
      jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue(mockUser as any);

      await accountsService.accountsBulkDelete(accountIds, userPayload as any);

      expect(
        invitationRepository.removeInvitationByInvitationUserAndAccountId,
      ).toHaveBeenCalledWith(mockUser.email, 1);
      expect(
        invitationRepository.removeInvitationByInvitationUserAndAccountId,
      ).toHaveBeenCalledWith(mockUser.email, 2);
    });

    it('should set a default account if no default account exists after deletion', async () => {
      const accountIds = [1, 2];
      const userPayload = { id: 3 };
      const userAccounts = [
        { account: { id: 1, owner: { id: 4 } } },
        { account: { id: 2, owner: { id: 5 } } },
      ];
      const mockUser = { id: 3, email: 'user@example.com' };
      const mockAccount = { id: 10, owner: { id: 3 } };

      jest
        .spyOn(accountsService, 'getExistingUserAccounts')
        .mockResolvedValue(userAccounts as any);
      jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(accountUserRepository, 'getUserAccountByDefault')
        .mockResolvedValue(null);
      jest
        .spyOn(accountUserRepository, 'getAnAccountByOwnerId')
        .mockResolvedValue(mockAccount as any);

      await accountsService.accountsBulkDelete(accountIds, userPayload as any);

      expect(accountUserRepository.save).toHaveBeenCalledWith({
        ...mockAccount,
        byDefault: true,
      });
    });

    it('should not set a default account if a default account already exists', async () => {
      const accountIds = [1, 2];
      const userPayload = { id: 3 };
      const userAccounts = [
        { account: { id: 1, owner: { id: 4 } } },
        { account: { id: 2, owner: { id: 5 } } },
      ];
      const mockUser = { id: 3, email: 'user@example.com' };
      const existingDefaultAccount = { id: 10, byDefault: true };

      jest
        .spyOn(accountsService, 'getExistingUserAccounts')
        .mockResolvedValue(userAccounts as any);
      jest
        .spyOn(userRepository, 'getUserById')
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(accountUserRepository, 'getUserAccountByDefault')
        .mockResolvedValue(existingDefaultAccount as any);

      await accountsService.accountsBulkDelete(accountIds, userPayload as any);

      expect(accountUserRepository.save).not.toHaveBeenCalled();
    });
  });
  //
  describe('bulkDelete', () => {
    const adminPayload = { id: 1 };
    const userIds = [1, 2];
    it('should throw ForbiddenException if trying to delete the account owner', async () => {
      const accountId = 10;
      const userAccount = { id: accountId, owner: { id: 1 } }; // Admin is owner

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await expect(
        accountsService.bulkDelete(adminPayload as any, userIds, accountId),
      ).rejects.toThrow(ForbiddenException);

      expect(accountsService.getExistingUserAccount).toHaveBeenCalledWith(
        adminPayload.id,
        accountId,
      );
    });

    it('should remove users from account if admin is not the owner', async () => {
      const accountId = 10;
      const userAccount = { id: accountId, owner: { id: 4 } }; // Another user is owner
      const accountUsers = [{ user: { id: 2 } }, { user: { id: 3 } }];

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(
          accountUserRepository,
          'getAccountUsersWithUserByAccountIdAndUserIds',
        )
        .mockResolvedValue(accountUsers as any);

      await accountsService.bulkDelete(adminPayload as any, userIds, accountId);

      expect(accountUserRepository.remove).toHaveBeenCalledWith(accountUsers);
    });

    it('should throw NotFoundException if no users are found for deletion', async () => {
      const userIds = [2, 3];
      const accountId = 10;
      const userAccount = { id: accountId, owner: { id: 4 } };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(
          accountUserRepository,
          'getAccountUsersWithUserByAccountIdAndUserIds',
        )
        .mockResolvedValue([]);

      await expect(
        accountsService.bulkDelete(adminPayload as any, userIds, accountId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should remove invitations for each deleted user', async () => {
      const userIds = [2, 3];
      const accountId = 10;
      const userAccount = { id: accountId, owner: { id: 4 } };
      const accountUsers = [
        { user: { id: 2, email: 'user2@example.com' } },
        { user: { id: 3, email: 'user3@example.com' } },
      ];

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(
          accountUserRepository,
          'getAccountUsersWithUserByAccountIdAndUserIds',
        )
        .mockResolvedValue(accountUsers as any);

      await accountsService.bulkDelete(adminPayload as any, userIds, accountId);

      expect(
        invitationRepository.removeInvitationsByInvitationUsersAndAccountId,
      ).toHaveBeenCalledWith(
        ['user2@example.com', 'user3@example.com'],
        accountId,
      );
    });

    it('should adjust account limits and add notification and publish RefreshFolderTreeEvent', async () => {
      const userIds = [2, 3];
      const accountId = 10;
      const userAccount = { id: accountId, owner: { id: 4 } };
      const accountUsers = [{ user: { id: 2 } }, { user: { id: 3 } }];

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(
          accountUserRepository,
          'getAccountUsersWithUserByAccountIdAndUserIds',
        )
        .mockResolvedValue(accountUsers as any);

      await accountsService.bulkDelete(adminPayload as any, userIds, accountId);

      expect(accountLimitsService.accountingOfUsers).toHaveBeenCalledWith(
        accountId,
        -2,
      );
      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendLettersToUsersAboutDeletingThemFromTheirAccount,
        { accountId, userIds, adminId: adminPayload.id },
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        new RefreshFolderTreeEvent({ accountId }),
      );
    });
  });
  //
  describe('changeAccountBranding', () => {
    it('should update emailReports, sharedLinks, and validatedBySerpnest flags correctly', async () => {
      const payload = {
        user: { id: 1 },
        accountId: 10,
        emailReports: BooleanEnum.TRUE,
        sharedLinks: BooleanEnum.FALSE,
        validatedBySerpnest: BooleanEnum.TRUE,
      };
      const userAccount = {
        id: 10,
        emailReports: false,
        sharedLinks: true,
        validatedBySerpnest: false,
        owner: { id: 1 },
      };
      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await accountsService.changeAccountBranding(payload as any);

      expect(accountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userAccount.id,
          emailReports: true,
          sharedLinks: false,
          validatedBySerpnest: true,
        }),
      );
    });

    it('should save new company logo and update companyLogoUrl', async () => {
      const payload = {
        user: { id: 1 },
        accountId: 10,
        companyLogo: 'logo.png',
      };
      const userAccount = {
        id: 10,
        companyLogo: 'oldLogo.png',
        owner: { id: 1 },
      };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      // @ts-ignore
      accountsService.saveCompanyLogo = jest
        .fn()
        // @ts-ignore
        .mockResolvedValue(storageItemCompanyLogoMock.originalFileName as any);
      jest.spyOn(accountRepository, 'save').mockResolvedValue({
        ...accountEntityMock,
        companyLogo: storageItemCompanyLogoMock,
      });
      jest
        .spyOn(storageService, 'getStorageItemUrl')
        .mockResolvedValue('http://url-to-newLogo.png');

      await accountsService.changeAccountBranding(payload as any);

      expect(storageService.getStorageItemUrl).toHaveBeenCalledWith(
        storageItemCompanyLogoMock,
      );
    });

    it('should retain existing company logo if none is provided in payload', async () => {
      const payload = {
        user: { id: userEntityMock.id },
        accountId: accountEntityMock.id as number,
      };
      const userAccount = {
        ...accountEntityMock,
        companyLogo: storageItemCompanyLogoMock,
        owner: userEntityMock,
      };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(storageService, 'getStorageItemUrl')
        .mockResolvedValue('http://url-to-oldLogo.png');
      // @ts-ignore
      accountsService.saveCompanyLogo = jest
        .fn()
        // @ts-ignore
        .mockResolvedValue(storageItemCompanyLogoMock.originalFileName as any);
      jest.spyOn(accountRepository, 'save').mockResolvedValue({
        ...accountEntityMock,
        companyLogo: storageItemCompanyLogoMock,
      });

      await accountsService.changeAccountBranding(payload as any);

      expect(accountRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userAccount.id,
        }),
      );
      expect(storageService.getStorageItemUrl).toHaveBeenCalledWith(
        storageItemCompanyLogoMock,
      );
    });

    it('should call createResponse with updated account details and folder tree', async () => {
      const payload = {
        user: { id: 1 },
        accountId: 10,
      };
      const userAccount = {
        id: 10,
        emailReports: false,
        sharedLinks: true,
        validatedBySerpnest: false,
        owner: { id: 1 },
        country: 'Country',
        timezone: 'Timezone',
      };
      const savedAccount = { ...userAccount, companyName: 'New Company' };
      const folderTree = [{ id: 1, name: 'Folder' }];
      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(accountRepository, 'save')
        .mockResolvedValue(savedAccount as any);
      jest
        .spyOn(foldersService, 'accessAvailableFolderTree')
        .mockResolvedValue(folderTree as any);
      jest
        .spyOn(storageService, 'getStorageItemUrl')
        .mockResolvedValue('http://url-to-companyLogo.png');

      await accountsService.changeAccountBranding(payload as any);

      expect(currentResponseFactory.createResponse).toHaveBeenCalledWith(
        {
          ...savedAccount,
          owner: userAccount.owner,
          country: userAccount.country,
          timezone: userAccount.timezone,
        },
        {
          companyLogoUrl: 'http://url-to-companyLogo.png',
          folderTree,
        },
      );
    });

    it('should return folder tree for the user', async () => {
      const payload = {
        user: { id: 1 },
        accountId: 10,
      };
      const userAccount = { id: 10, owner: { id: 1 }, companyLogo: 'logo.png' };
      const folderTree = [{ id: 1, name: 'Folder' }];

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(foldersService, 'accessAvailableFolderTree')
        .mockResolvedValue(folderTree as any);

      await accountsService.changeAccountBranding(payload as any);

      expect(foldersService.accessAvailableFolderTree).toHaveBeenCalledWith(
        payload.user.id,
      );
    });
  });
  //
  describe('deleteAccount', () => {
    it('should throw BadRequestException if account deletion is already requested', async () => {
      const payload = {
        user: { id: 1 },
        accountId: 10,
        reason: 'Reason for deletion',
      };
      const userAccount = { id: 10, deletedAt: new Date(), owner: { id: 1 } };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await expect(
        accountsService.deleteAccount(payload as any),
      ).rejects.toThrow(BadRequestException);
      expect(accountRepository.softRemove).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner of the account', async () => {
      const payload = {
        user: { id: 42 }, // not owner
        accountId: accountEntityMock.id,
        reason: 'Reason for deletion',
      };
      const userAccount = {
        ...accountEntityMock,
        // @ts-ignore
        deletedAt: null,
        owner: { ...userEntityMock },
        subscription: {
          status: { name: SubscriptionStatusesEnum.activated },
          tariffPlanSetting: {
            tariffPlan: { name: TariffPlansEnum.StarterPlan },
          },
        },
      };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await expect(
        accountsService.deleteAccount(payload as any),
      ).rejects.toThrow(ForbiddenException);
      expect(accountRepository.softRemove).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if account has active subscription and is not on a trial period', async () => {
      const payload = {
        user: { id: userEntityMock.id },
        accountId: accountEntityMock.id,
        reason: 'Reason for deletion',
      };
      const userAccount = {
        ...accountEntityMock,
        // @ts-ignore
        deletedAt: null,
        owner: { ...userEntityMock },
        subscription: {
          status: { name: SubscriptionStatusesEnum.activated },
          tariffPlanSetting: {
            tariffPlan: { name: TariffPlansEnum.StarterPlan },
          },
        },
      };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await expect(
        accountsService.deleteAccount(payload as any),
      ).rejects.toThrow(BadRequestException);
      expect(accountRepository.softRemove).not.toHaveBeenCalled();
    });

    it('should successfully delete account, save reason for deletion, and send notifications', async () => {
      const payload = {
        user: { id: userEntityMock.id },
        accountId: accountEntityMock.id,
        reason: 'Reason for deletion',
      };
      const userAccount = {
        ...accountEntityMock,
        // @ts-ignore
        deletedAt: null,
        owner: { ...userEntityMock },
        subscription: {
          status: { name: SubscriptionStatusesEnum.canceled },
          tariffPlanSetting: {
            tariffPlan: { name: TariffPlansEnum.TrialPeriod },
          },
        },
      };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      const expectedDeletedAt = moment().add(30, 'days').format('MMM, D YYYY');

      const result = await accountsService.deleteAccount(payload as any);

      expect(accountRepository.softRemove).toHaveBeenCalledWith(userAccount);
      expect(reasonsForAccountDeletionRepository.save).toHaveBeenCalledWith({
        accountId: userAccount.id,
        reason: payload.reason,
      });
      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendAnEmailAboutDeletingAccount,
        { userId: userAccount.owner.id },
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: payload.accountId,
          typeOfReason: TypesOfReasonsForUnsubscriptionEnum.other,
          reason: payload.reason,
        }),
      );
      expect(result).toEqual({ deletedAt: expectedDeletedAt });
    });
  });
  //
  describe('changeAccountSettings', () => {
    it('should throw ForbiddenException if user tries to change first or last name of another user', async () => {
      const payload = {
        user: { id: 42 }, // not owner
        accountId: accountEntityMock.id,
        firstName: 'NewName',
        lastName: 'NewLastName',
      };
      const userAccount = {
        ...accountEntityMock,
        owner: {
          id: userEntityMock.id,
          firstName: 'OldName',
          lastName: 'OldLastName',
        },
      };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await expect(
        accountsService.changeAccountSettings(payload as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if current password is provided without new password', async () => {
      const payload = {
        user: { id: userEntityMock.id },
        accountId: accountEntityMock.id,
        currentPassword: 'currentPassword',
      };
      const userAccount = { owner: { id: userEntityMock.id } };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);

      await expect(
        accountsService.changeAccountSettings(payload as any),
      ).rejects.toThrow(BadRequestException);
    });

    it("should successfully change user's country, timezone, and name if owner", async () => {
      const payload: ChangeAccountSettingsType = {
        user: {
          id: userEntityMock.id,
          accounts: [{ id: accountEntityMock.id, role: roleAdminEntityMock }],
        },
        accountId: accountEntityMock.id,
        countryId: 100,
        timezoneId: 200,
        firstName: 'UpdatedFirstName',
        lastName: 'UpdatedLastName',
      };
      const userAccount = {
        ...accountEntityMock,
        owner: {
          id: userEntityMock.id,
          firstName: 'OldFirstName',
          lastName: 'OldLastName',
        },
      };
      const country = { id: 100, name: 'NewCountry' };
      const timezone = { id: 200, name: 'NewTimezone' };

      jest
        .spyOn(accountRepository, 'getAccountById')
        .mockResolvedValue(userAccount as any);
      // @ts-ignore
      accountsService.getExistingUserAccount = jest
        .fn()
        // @ts-ignore
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(accountsService['countriesService'], 'getExistingCountry')
        .mockResolvedValue(country as any);
      jest
        .spyOn(accountsService['timezoneService'], 'getExistingTimezone')
        .mockResolvedValue(timezone as any);

      await accountsService.changeAccountSettings(payload);

      expect(accountsService['userRepository'].save).toHaveBeenCalledWith({
        id: userAccount.owner.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        username: `${payload.firstName} ${payload.lastName}`,
      });
      expect(accountsService['accountRepository'].save).toHaveBeenCalledWith({
        id: userAccount.id,
        country,
        timezone,
      });
    });

    it('should update account settings and return a response with updated folder tree and company logo URL', async () => {
      const payload = {
        user: { id: userEntityMock.id },
        accountId: accountEntityMock.id,
        countryId: 100,
        timezoneId: 200,
      };
      const userAccount = {
        accountEntityMock,
        owner: { ...userEntityMock },
        companyLogo: 'companyLogo.png',
      };
      const country = { id: 100, name: 'CountryName' };
      const timezone = { id: 200, name: 'TimezoneName' };
      const folderTree = [{ id: 1, name: 'Folder' }];
      const companyLogoUrl = 'https://storage.company.com/companyLogo.png';
      const account = { id: 1, owner: { id: 1 } };

      jest
        .spyOn(accountsService, 'getExistingUserAccount')
        .mockResolvedValue(userAccount as any);
      jest
        .spyOn(accountsService['countriesService'], 'getExistingCountry')
        .mockResolvedValue(country as any);
      jest
        .spyOn(accountsService['timezoneService'], 'getExistingTimezone')
        .mockResolvedValue(timezone as any);
      jest
        .spyOn(accountsService['foldersService'], 'accessAvailableFolderTree')
        .mockResolvedValue(folderTree as any);
      jest
        .spyOn(accountsService['storageService'], 'getStorageItemUrl')
        .mockResolvedValue(companyLogoUrl);
      jest
        .spyOn(accountsService['accountRepository'], 'getAccountById')
        .mockResolvedValue(account as any);
      jest
        .spyOn(accountsService['currentResponseFactory'], 'createResponse')
        .mockReturnValue({ response: 'mocked response' } as any);

      const result = await accountsService.changeAccountSettings(
        payload as any,
      );

      expect(result).toEqual({ response: 'mocked response' });
      expect(
        accountsService['currentResponseFactory'].createResponse,
      ).toHaveBeenCalledWith(userAccount, {
        companyLogoUrl,
        folderTree,
      });
      expect(
        accountsService['gatewayService'].handleUserResponse,
      ).toHaveBeenCalled();
    });
  });
  //
  describe('createAccount', () => {
    it('should create an account with provided country and timezone', async () => {
      const payload: CreateAccountType = {
        owner: { ...userEntityMock, username: 'John Doe' },
        countryId: 100,
        timezoneId: 200,
        tariffPlan: 1,
      };

      const country = { id: 100, name: 'ProvidedCountry' };
      const timezone = { id: 200, name: 'ProvidedTimezone' };
      const role = { name: RoleEnum.Admin };
      const preferredTariffPlan = { id: 1, name: TariffPlansEnum.TrialPeriod };
      const account = {
        ...accountEntityMock,
        owner: payload.owner,
        country,
        timezone,
        preferredTariffPlan,
      };

      jest
        .spyOn(accountsService['countriesService'], 'getExistingCountry')
        .mockResolvedValue(country as any);
      jest
        .spyOn(accountsService['timezoneService'], 'getExistingTimezone')
        .mockResolvedValue(timezone as any);
      jest
        .spyOn(accountsService['roleRepository'], 'getRoleByName')
        .mockResolvedValue(role as any);
      jest
        .spyOn(
          accountsService['tariffPlanSettingRepository'],
          'getTariffPlanById',
        )
        .mockResolvedValue(preferredTariffPlan as any);
      jest
        .spyOn(accountsService['accountRepository'], 'save')
        .mockResolvedValue(account as any);

      await accountsService.createAccount(payload);

      expect(
        accountsService['countriesService'].getExistingCountry,
      ).toHaveBeenCalledWith(payload.countryId);
      expect(
        accountsService['timezoneService'].getExistingTimezone,
      ).toHaveBeenCalledWith(payload.timezoneId);
      expect(
        accountsService['roleRepository'].getRoleByName,
      ).toHaveBeenCalledWith('Admin');
      expect(accountsService['accountRepository'].save).toHaveBeenCalledWith({
        ...payload,
        country,
        timezone,
        preferredTariffPlan,
      });
    });

    it('should create an account with default country and timezone if not provided', async () => {
      const payload: CreateAccountType = {
        owner: { ...userEntityMock, username: 'John Doe' },
        tariffPlan: 1,
      };

      const defaultCountry = { id: 999, name: 'Australia' };
      const defaultTimezone = { id: 888, name: 'DefaultTimezone' };
      const role = { ...roleAdminEntityMock };
      const account = {
        ...accountEntityMock,
        owner: payload.owner,
        country: defaultCountry,
        timezone: defaultTimezone,
      };

      jest
        .spyOn(accountsService['countriesService'], 'getCountry')
        .mockResolvedValue(defaultCountry as any);
      jest
        .spyOn(accountsService['timezoneService'], 'getTimezone')
        .mockResolvedValue(defaultTimezone as any);
      jest
        .spyOn(accountsService['roleRepository'], 'getRoleByName')
        .mockResolvedValue(role as any);
      jest
        .spyOn(accountsService['accountRepository'], 'save')
        .mockResolvedValue(account as any);

      await accountsService.createAccount(payload);

      expect(
        accountsService['countriesService'].getCountry,
      ).toHaveBeenCalledWith('Australia');
      expect(
        accountsService['timezoneService'].getTimezone,
      ).toHaveBeenCalledWith(
        '(GMT+08:00) Kuching, Kota Kinabalu, Sandakan, Tawau, Miri',
      );
      expect(
        accountsService['roleRepository'].getRoleByName,
      ).toHaveBeenCalledWith('Admin');
      expect(accountsService['accountRepository'].save).toHaveBeenCalledWith({
        country: defaultCountry,
        owner: {
          createdAt: '2024-09-26T11:53:39.892Z',
          email: 'test@test.com',
          emailConfirmationToken: 'new-uuid-token',
          firstName: 'Test',
          googleId: null,
          id: 2,
          isEmailConfirmed: false,
          lastName: '',
          numberOfForgotPasswordLetterRequests: 0,
          numberOfResendingMailConfirmationLetterRequest: 0,
          password:
            '$argon2id$v=19$m=4096,t=3,p=1$VNoBYYYmlmM5SBe1/nb/Rw$CD6wPIawn0t2zxlobXAiRnu6Cgzo/jYuxUE1jS0a7F4',
          passwordResetConfirmationToken: null,
          status: { id: '1', name: 'Activated' },
          tariffPlan: 4,
          updatedAt: '2024-09-26T11:53:39.892Z',
          username: 'John Doe',
        },
        preferredTariffPlan: undefined,
        tariffPlan: 1,
        timezone: defaultTimezone,
      });
    });

    it('should create an account and set up folders and API key', async () => {
      const payload: CreateAccountType = {
        owner: { ...userEntityMock, username: 'John Doe' },
        tariffPlan: 1,
        countryId: 100,
        timezoneId: 200,
      };

      const country = { id: 100, name: 'CountryName' };
      const timezone = { id: 200, name: 'TimezoneName' };
      const role = { name: 'Admin' };
      const account = { id: 1, owner: payload.owner, country, timezone };

      jest
        .spyOn(accountsService['countriesService'], 'getExistingCountry')
        .mockResolvedValue(country as any);
      jest
        .spyOn(accountsService['timezoneService'], 'getExistingTimezone')
        .mockResolvedValue(timezone as any);
      jest
        .spyOn(accountsService['roleRepository'], 'getRoleByName')
        .mockResolvedValue(role as any);
      jest
        .spyOn(accountsService['accountRepository'], 'save')
        .mockResolvedValue(account as any);
      // @ts-ignore
      accountsService.saveApiKey = jest.fn().mockResolvedValue(void 0);
      jest
        .spyOn(accountsService['foldersService'], 'creatingMasterAccountFolder')
        .mockResolvedValue();

      await accountsService.createAccount(payload);

      expect(accountsService['accountRepository'].save).toHaveBeenCalled();
      expect(accountsService.saveApiKey).toHaveBeenCalledWith(account);
      expect(
        accountsService['foldersService'].creatingMasterAccountFolder,
      ).toHaveBeenCalledWith({
        account,
        user: payload.owner,
      });
    });

    it('should throw NotFoundException if provided country or timezone does not exist', async () => {
      const payload: CreateAccountType = {
        owner: { ...userEntityMock },
        tariffPlan: 1,
        countryId: 9999,
        timezoneId: 8888,
      };

      jest
        .spyOn(accountsService['countriesService'], 'getExistingCountry')
        .mockRejectedValue(new NotFoundException());
      jest
        .spyOn(accountsService['timezoneService'], 'getExistingTimezone')
        .mockRejectedValue(new NotFoundException());

      await expect(accountsService.createAccount(payload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
  //
});
