import { UserAuthService } from 'modules/auth/services/user-auth.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Queues } from 'modules/queue/enums/queues.enum';
import { getQueueToken } from '@nestjs/bull';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { UserStatusRepository } from 'modules/users/repositories/user-status.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { jest } from '@jest/globals';
import { InvitationsService } from 'modules/invitations/services/invitations.service';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { LoginAccountResponseFactory } from 'modules/auth/factories/login-account-response.factory';
import { FoldersService } from 'modules/folders/services/folders.service';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { EventBus } from '@nestjs/cqrs';
import { LoginResponseFactory } from 'modules/auth/factories/login-response.factory';
import { userEntityMock } from '../../mocks/entities/user-entity.mock';
import { accountEntityMock } from '../../mocks/entities/account-entity.mock';
import { CreateATrialPeriodEvent } from 'modules/accounts/events/create-a-trial-period.event';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRegistrationRequest } from 'modules/users/requests/user-registration.request';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { UserStatusEnum } from 'modules/users/enums/user-status.enum';

jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

describe('UserAuthService', () => {
  let userAuthService: UserAuthService;
  let userRepository: UserRepository;
  let eventBus: EventBus;
  let cryptoUtilService: CryptoUtilsService;
  let configService: ConfigService;
  let accountsService: AccountsService;
  let loginAccountResponseFactory: LoginAccountResponseFactory;
  let invitationsService: InvitationsService;
  let foldersService: FoldersService;
  let projectsService: ProjectsService;
  let mailingQueue: Queue;
  let userStatusRepository: UserStatusRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthService,
        {
          provide: LoginAccountResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: LoginResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: getQueueToken(Queues.Mailing),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            constructor: jest.fn(),
            save: jest.fn(),
            getUserByEmail: jest.fn(),
            getUserByGoogleId: jest.fn(),
            getUserByEmailConfirmationToken: jest.fn(),
          },
        },
        {
          provide: RoleRepository,
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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
          provide: UserStatusRepository,
          useValue: {
            getStatusByName: jest.fn(),
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
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'SERPNEST_JWT_SECRET_KEY':
                  return 'test-jwt-secret-key';
                case 'ACCESS_TOKEN_LIFETIME_IN_SECONDS':
                  return 3000;
                default:
                  return null;
              }
            }),
          },
        },
        {
          provide: InvitationsService,
          useValue: {
            getUserInvitations: jest.fn(),
          },
        },
        {
          provide: AccountsService,
          useValue: {
            createAccount: jest.fn(),
            addUserToAccount: jest.fn(),
            getUserAccountsByUserId: jest.fn(),
          },
        },
        {
          provide: FoldersService,
          useValue: {
            addUserToFolders: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            addUserToProjects: jest.fn(),
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
      ],
    }).compile();

    userAuthService = module.get<UserAuthService>(UserAuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    eventBus = module.get<EventBus>(EventBus);
    cryptoUtilService = module.get<CryptoUtilsService>(CryptoUtilsService);
    configService = module.get<ConfigService>(ConfigService);
    accountsService = module.get<AccountsService>(AccountsService);
    loginAccountResponseFactory = module.get<LoginAccountResponseFactory>(
      LoginAccountResponseFactory,
    );
    invitationsService = module.get<InvitationsService>(InvitationsService);
    foldersService = module.get<FoldersService>(FoldersService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    mailingQueue = module.get<Queue>(getQueueToken(Queues.Mailing));
    userStatusRepository =
      module.get<UserStatusRepository>(UserStatusRepository);
  });

  it('should be defined', () => {
    expect(userAuthService).toBeDefined();
  });
  //
  describe('confirmEmail', () => {
    const mockToken = userEntityMock.emailConfirmationToken;

    it('should confirm email successfully', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmailConfirmationToken')
        .mockResolvedValueOnce({
          ...userEntityMock,
          account: accountEntityMock,
        });

      await userAuthService.confirmEmail({
        emailConfirmationToken: mockToken,
      });

      expect(
        userRepository.getUserByEmailConfirmationToken,
      ).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...userEntityMock,
        account: accountEntityMock,
        emailConfirmationToken: null,
        isEmailConfirmed: true,
      });
      expect(eventBus.publish).toHaveBeenCalledWith(
        new CreateATrialPeriodEvent({ accountId: accountEntityMock.id }),
      );
    });
    it('should throw NotFoundException if token is invalid', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmailConfirmationToken')
        .mockResolvedValueOnce(null);

      await expect(
        userAuthService.confirmEmail({
          emailConfirmationToken: mockToken,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
    it('should throw NotFoundException if emailConfirmationToken is already null', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmailConfirmationToken')
        .mockResolvedValueOnce({
          ...userEntityMock,
          emailConfirmationToken: null,
          account: accountEntityMock,
        });

      await expect(
        userAuthService.confirmEmail({
          emailConfirmationToken: mockToken,
        }),
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
    });
  });
  //
  describe('loginUser', () => {
    const payload = {
      email: userEntityMock.email,
      password: 'correct_password',
    };

    const mockLoginUser = {
      ...userEntityMock,
      isEmailConfirmed: true,
      accountUsers: [
        {
          id: 2,
          user: { ...userEntityMock },
          account: { ...accountEntityMock },
        } as any,
      ],
    };

    it('should login user successfully', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue(mockLoginUser);
      jest
        .spyOn(cryptoUtilService, 'verifyPasswordHash')
        .mockResolvedValue(true);
      jest
        .spyOn(accountsService, 'getUserAccountsByUserId')
        .mockResolvedValue([accountEntityMock as any]);
      jest
        .spyOn(loginAccountResponseFactory, 'createResponse')
        .mockReturnValue({
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        } as any);

      const result = await userAuthService.loginUser(payload);

      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(payload.email);
      expect(cryptoUtilService.verifyPasswordHash).toHaveBeenCalledWith(
        payload.password,
        userEntityMock.password,
      );
      expect(userRepository.save).toHaveBeenCalledWith({
        id: userEntityMock.id,
        updatedAt: expect.any(Date),
      });
    });
    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue(null);

      await expect(userAuthService.loginUser(payload)).rejects.toThrow(
        new BadRequestException('Incorrect email or password'),
      );
    });
    it('should throw BadRequestException if email is not confirmed', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue({ ...mockLoginUser, isEmailConfirmed: false });

      await expect(userAuthService.loginUser(payload)).rejects.toThrow(
        new BadRequestException('User account not confirmed'),
      );
    });
    it('should throw BadRequestException if password is incorrect', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue(mockLoginUser);
      jest
        .spyOn(cryptoUtilService, 'verifyPasswordHash')
        .mockResolvedValue(false);

      await expect(userAuthService.loginUser(payload)).rejects.toThrow(
        new BadRequestException('The password you entered is incorrect'),
      );

      expect(cryptoUtilService.verifyPasswordHash).toHaveBeenCalledWith(
        payload.password,
        mockLoginUser.password,
      );
    });
  });
  //
  describe('registerUser', () => {
    const payload = {
      email: userEntityMock.email,
      password: 'password123',
      tariffPlan: 1,
      timezoneId: 1,
      countryId: 1,
    } as UserRegistrationRequest;

    it('should register user successfully', async () => {
      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue(null);
      // @ts-ignore
      userAuthService.createPasswordProtectedUser = jest
        .fn()
        // @ts-ignore
        .mockResolvedValue(userEntityMock);
      jest
        .spyOn(invitationsService, 'getUserInvitations')
        .mockResolvedValue([]);
      jest.spyOn(accountsService, 'createAccount').mockResolvedValue(void 0);

      await userAuthService.registerUser(payload);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(payload.email);
      expect(userAuthService.createPasswordProtectedUser).toHaveBeenCalledWith(
        payload,
      );
      expect(accountsService.createAccount).toHaveBeenCalledWith({
        owner: userEntityMock,
        tariffPlan: payload.tariffPlan,
        timezoneId: payload.timezoneId,
        countryId: payload.countryId,
      });
      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendRegistrationConfirmationEmail,
        { userId: userEntityMock.id },
      );
    });
    it('should throw BadRequestException if email is already in use', async () => {
      jest
        .spyOn(userRepository, 'getUserByEmail')
        .mockResolvedValue({ ...userEntityMock });
      // @ts-ignore
      userAuthService.createPasswordProtectedUser = jest
        .fn()
        // @ts-ignore
        .mockResolvedValue(userEntityMock);

      await expect(userAuthService.registerUser(payload)).rejects.toThrow(
        new BadRequestException('This email address is already in use.'),
      );

      expect(
        userAuthService.createPasswordProtectedUser,
      ).not.toHaveBeenCalled();
      expect(accountsService.createAccount).not.toHaveBeenCalled();
      expect(mailingQueue.add).not.toHaveBeenCalled();
    });

    it('should add user to folders and projects if invitations exist', async () => {
      const invitations = [
        {
          foldersInvitations: [{ folderId: 1 }],
          projectsInvitations: [{ projectId: 1 }],
          account: { ...accountEntityMock },
          role: 'member',
        },
      ];

      jest.spyOn(userRepository, 'getUserByEmail').mockResolvedValue(null);
      // ts
      // @ts-ignore
      userAuthService.createPasswordProtectedUser = jest
        .fn()
        // @ts-ignore
        .mockResolvedValue(userEntityMock);
      jest
        .spyOn(invitationsService, 'getUserInvitations')
        .mockResolvedValue(invitations as any);
      jest.spyOn(foldersService, 'addUserToFolders').mockResolvedValue(void 0);
      jest
        .spyOn(projectsService, 'addUserToProjects')
        .mockResolvedValue(void 0);
      jest.spyOn(accountsService, 'addUserToAccount').mockResolvedValue(void 0);

      await userAuthService.registerUser(payload);

      expect(foldersService.addUserToFolders).toHaveBeenCalledWith(
        userEntityMock,
        invitations[0].foldersInvitations,
      );
      expect(projectsService.addUserToProjects).toHaveBeenCalledWith(
        userEntityMock,
        invitations[0].projectsInvitations,
      );
      expect(accountsService.addUserToAccount).toHaveBeenCalledWith(
        userEntityMock,
        invitations[0].account,
        invitations[0].role,
      );
    });
  });
  //
  describe('createPasswordProtectedUser', () => {
    it('should create and save a user with a hashed password and email confirmation token', async () => {
      const payload = {
        email: 'testuser@example.com',
        password: 'password123',
        username: 'TestUser',
      };

      const hashedPassword = 'hashedPassword123';
      const emailConfirmationToken = 'email-confirmation-token';
      const userStatus = { id: 1, name: UserStatusEnum.Activated };

      jest
        .spyOn(cryptoUtilService, 'generatePasswordHash')
        .mockResolvedValue(hashedPassword);
      jest
        .spyOn(cryptoUtilService, 'generateUUID')
        .mockReturnValue(emailConfirmationToken);
      jest
        .spyOn(userStatusRepository, 'getStatusByName')
        .mockResolvedValue(userStatus);

      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...payload,
        password: hashedPassword,
        emailConfirmationToken,
        status: userStatus,
        firstName: payload.username,
        lastName: '',
      } as any);

      const result = await userAuthService.createPasswordProtectedUser(payload);

      expect(cryptoUtilService.generatePasswordHash).toHaveBeenCalledWith(
        payload.password,
      );
      expect(userStatusRepository.getStatusByName).toHaveBeenCalledWith(
        UserStatusEnum.Activated,
      );
      expect(cryptoUtilService.generateUUID).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith({
        ...payload,
        firstName: payload.username,
        lastName: '',
        password: hashedPassword,
        emailConfirmationToken,
        status: userStatus,
      });

      expect(result).toEqual({
        ...payload,
        password: hashedPassword,
        emailConfirmationToken,
        status: userStatus,
        firstName: payload.username,
        lastName: '',
      });
    });
  });
  //
});
