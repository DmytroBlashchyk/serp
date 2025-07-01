import { InvitationsService } from 'modules/invitations/services/invitations.service';
import { Test, TestingModule } from '@nestjs/testing';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { jest } from '@jest/globals';
import { RolesService } from 'modules/users/services/roles.service';
import { UsersService } from 'modules/users/services/users.service';
import { FoldersService } from 'modules/folders/services/folders.service';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { getQueueToken } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { InvitationResponseFactory } from 'modules/invitations/factories/invitation-response.factory';
import { AccountUsersService } from 'modules/accounts/services/account-users.service';
import { EventBus } from '@nestjs/cqrs';
import { InvitedUserResponseFactory } from 'modules/invitations/factories/invited-user-response.factory';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { invitationEntityMock } from '../../mocks/entities/invitation-entity.mock';
import { roleAdminEntityMock } from '../../mocks/entities/role-entity.mock';
import { accountEntityMock } from '../../mocks/entities/account-entity.mock';
import {
  projectOneEntityMock,
  projectThreeEntityMock,
  projectTwoEntityMock,
} from '../../mocks/entities/project-entity.mock';
import {
  folderOneEntityMock,
  folderThreeEntityMock,
  folderTwoEntityMock,
} from '../../mocks/entities/folder-entity.mock';
import { Queue } from 'bull';
import { userEntityMock } from '../../mocks/entities/user-entity.mock';
import { RoleEnum } from 'modules/auth/enums/role.enum';
import { CreateInvitationType } from 'modules/invitations/types/create-invitation.type';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';

jest.mock('typeorm-transactional-cls-hooked', () => ({
  Transactional: () => () => ({}),
  BaseRepository: class {},
}));

describe('InvitationsService', () => {
  let invitationsService: InvitationsService;
  let invitationRepository: InvitationRepository;
  let rolesService: RolesService;
  let eventBus: EventBus;
  let accountsService: AccountsService;
  let usersService: UsersService;
  let foldersService: FoldersService;
  let projectsService: ProjectsService;
  let accountLimitsService: AccountLimitsService;
  let mailingQueue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: InvitationRepository,
          useValue: {
            save: jest.fn(),
            getInvitationById: jest.fn(),
            deleteInvitationsWithoutProjectsAndFolders: jest.fn(),
            retrieveProjectsAssignedToANonRegisteredUser: jest.fn(),
            deleteProjectsOfAnInvitedUser: jest.fn(),
            addProjectsToAnInvitedUser: jest.fn(),
            retrieveFoldersAssignedToANonRegisteredUser: jest.fn(),
            addFoldersToAnInvitedUser: jest.fn(),
            deleteFoldersOfAnInvitedUser: jest.fn(),
            getExistingInvitation: jest.fn(),
          },
        },
        {
          provide: AccountsService,
          useValue: {
            createAccount: jest.fn(),
            getExistingUserAccount: jest.fn(),
            addUserToAccount: jest.fn(),
          },
        },
        {
          provide: RolesService,
          useValue: {
            getRoleByName: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
            getUserByEmailWithAccounts: jest.fn(),
          },
        },
        {
          provide: FoldersService,
          useValue: {
            addUserToFolders: jest.fn(),
            getFoldersWithChildFoldersAndProjects: jest.fn(),
          },
        },
        {
          provide: ProjectsService,
          useValue: {
            addUserToProjects: jest.fn(),
            getProjects: jest.fn(),
          },
        },
        {
          provide: getQueueToken(Queues.Mailing),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: AccountLimitsService,
          useValue: {
            getAllLimitsOfCurrentAccount: jest.fn(),
            accountingOfUsers: jest.fn(),
            accountingOfInvitations: jest.fn(),
          },
        },
        {
          provide: InvitationResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: InvitedUserResponseFactory,
          useValue: {
            createResponse: jest.fn(),
          },
        },
        {
          provide: AccountUsersService,
          useValue: {
            getAccountUser: jest.fn(),
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
    invitationsService = module.get<InvitationsService>(InvitationsService);
    invitationRepository =
      module.get<InvitationRepository>(InvitationRepository);
    rolesService = module.get<RolesService>(RolesService);
    eventBus = module.get<EventBus>(EventBus);
    mailingQueue = module.get<Queue>(getQueueToken(Queues.Mailing));
    accountsService = module.get<AccountsService>(AccountsService);
    usersService = module.get<UsersService>(UsersService);
    foldersService = module.get<FoldersService>(FoldersService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    accountLimitsService =
      module.get<AccountLimitsService>(AccountLimitsService);
  });
  it('should be defined', () => {
    expect(invitationsService).toBeDefined();
  });
  //
  describe('update', () => {
    beforeEach(async () => {
      jest
        .spyOn(invitationsService, 'updateProjectsAssignedToUser')
        .mockResolvedValue();
      jest
        .spyOn(invitationsService, 'updateUserAssignedFolders')
        .mockResolvedValue();
    });

    it('should throw NotFoundException if invitation is not found', async () => {
      jest
        .spyOn(invitationRepository, 'getInvitationById')
        .mockResolvedValue(null);

      await expect(
        invitationsService.update({ id: 42, accountId: 2 } as any),
      ).rejects.toThrow(NotFoundException);

      expect(invitationRepository.getInvitationById).toHaveBeenCalledWith(42);
    });

    it('should update role if roleName is provided', async () => {
      const mockInvitation = { ...invitationEntityMock };
      const mockRole = { ...roleAdminEntityMock };

      jest
        .spyOn(invitationRepository, 'getInvitationById')
        .mockResolvedValue(mockInvitation);
      jest.spyOn(rolesService, 'getRoleByName').mockResolvedValue(mockRole);

      await invitationsService.update({
        id: invitationEntityMock.id,
        accountId: accountEntityMock.id,
        roleName: roleAdminEntityMock.name,
      } as any);

      expect(rolesService.getRoleByName).toHaveBeenCalledWith('Admin');
      expect(invitationRepository.save).toHaveBeenCalledWith({
        ...mockInvitation,
        role: mockRole,
      });
    });

    it('should update projects and folders assigned to the user', async () => {
      const mockInvitation = { ...invitationEntityMock };

      jest
        .spyOn(invitationRepository, 'getInvitationById')
        .mockResolvedValue(mockInvitation);

      await invitationsService.update({
        id: invitationEntityMock.id,
        accountId: accountEntityMock.id,
        projectIds: [projectOneEntityMock.id, projectTwoEntityMock.id],
        folderIds: [folderOneEntityMock.id, folderTwoEntityMock.id],
      });

      expect(
        invitationsService.updateProjectsAssignedToUser,
      ).toHaveBeenCalledWith(accountEntityMock.id, invitationEntityMock.id, [
        projectOneEntityMock.id,
        projectTwoEntityMock.id,
      ]);
      expect(invitationsService.updateUserAssignedFolders).toHaveBeenCalledWith(
        accountEntityMock.id,
        invitationEntityMock.id,
        [folderOneEntityMock.id, folderTwoEntityMock.id],
      );
    });

    it('should delete invitations without projects and folders', async () => {
      const mockInvitation = { ...invitationEntityMock };

      jest
        .spyOn(invitationRepository, 'getInvitationById')
        .mockResolvedValue(mockInvitation);

      await invitationsService.update({
        id: invitationEntityMock.id,
        accountId: accountEntityMock.id,
      } as any);

      expect(
        invitationRepository.deleteInvitationsWithoutProjectsAndFolders,
      ).toHaveBeenCalled();
    });

    it('should publish RefreshFolderTreeEvent', async () => {
      const mockInvitation = { ...invitationEntityMock };

      jest
        .spyOn(invitationRepository, 'getInvitationById')
        .mockResolvedValue(mockInvitation);

      await invitationsService.update({
        id: invitationEntityMock.id,
        accountId: accountEntityMock.id,
      } as any);

      expect(eventBus.publish).toHaveBeenCalledWith(
        new RefreshFolderTreeEvent({ accountId: accountEntityMock.id } as any),
      );
    });
  });
  //
  describe('updateProjectsAssignedToUser', () => {
    it('should delete projects that are no longer assigned', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveProjectsAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([
          { id: projectOneEntityMock.id },
          { id: projectTwoEntityMock.id },
        ]);

      await invitationsService.updateProjectsAssignedToUser(
        accountEntityMock.id,
        invitationEntityMock.id,
        [projectTwoEntityMock.id],
      );

      expect(
        invitationRepository.deleteProjectsOfAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        projectOneEntityMock.id,
      ]);
      expect(
        invitationRepository.addProjectsToAnInvitedUser,
      ).not.toHaveBeenCalled();
    });

    it('should add new projects that are not currently assigned', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveProjectsAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([{ id: projectOneEntityMock.id }]);

      await invitationsService.updateProjectsAssignedToUser(
        accountEntityMock.id,
        invitationEntityMock.id,
        [projectOneEntityMock.id, projectTwoEntityMock.id], // new project 2 should be added
      );

      expect(
        invitationRepository.addProjectsToAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        projectTwoEntityMock.id,
      ]);
      expect(
        invitationRepository.deleteProjectsOfAnInvitedUser,
      ).not.toHaveBeenCalled();
    });

    it('should handle both adding and deleting projects', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveProjectsAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([
          { id: projectTwoEntityMock.id },
          { id: projectOneEntityMock.id },
        ]);

      await invitationsService.updateProjectsAssignedToUser(
        accountEntityMock.id,
        invitationEntityMock.id,
        [projectTwoEntityMock.id, projectThreeEntityMock.id],
      );

      expect(
        invitationRepository.deleteProjectsOfAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        projectOneEntityMock.id,
      ]);
      expect(
        invitationRepository.addProjectsToAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        projectThreeEntityMock.id,
      ]);
    });

    it('should do nothing if the projects remain unchanged', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveProjectsAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([
          { id: projectTwoEntityMock.id },
          { id: projectOneEntityMock.id },
        ]);

      await invitationsService.updateProjectsAssignedToUser(
        accountEntityMock.id,
        invitationEntityMock.id,
        [projectOneEntityMock.id, projectTwoEntityMock.id],
      );

      expect(
        invitationRepository.deleteProjectsOfAnInvitedUser,
      ).not.toHaveBeenCalled();
      expect(
        invitationRepository.addProjectsToAnInvitedUser,
      ).not.toHaveBeenCalled();
    });
  });
  //
  describe('updateUserAssignedFolders', () => {
    it('should add new folders that are not currently assigned', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveFoldersAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([{ id: folderOneEntityMock.id }]);

      await invitationsService.updateUserAssignedFolders(
        accountEntityMock.id,
        invitationEntityMock.id,
        [folderOneEntityMock.id, folderThreeEntityMock.id], // Новый список папок с "folder3", которого не было.
      );

      expect(
        invitationRepository.addFoldersToAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        folderThreeEntityMock.id,
      ]);
      expect(
        invitationRepository.deleteFoldersOfAnInvitedUser,
      ).not.toHaveBeenCalled();
    });

    it('should handle both adding and deleting folders', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveFoldersAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([
          { id: folderOneEntityMock.id },
          { id: folderTwoEntityMock.id },
        ]);

      await invitationsService.updateUserAssignedFolders(
        accountEntityMock.id,
        invitationEntityMock.id,
        [folderTwoEntityMock.id, folderThreeEntityMock.id],
      );

      expect(
        invitationRepository.deleteFoldersOfAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [folderOneEntityMock.id]);
      expect(
        invitationRepository.addFoldersToAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        folderThreeEntityMock.id,
      ]);
    });

    it('should do nothing if the folders remain unchanged', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveFoldersAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([
          { id: folderOneEntityMock.id },
          { id: folderTwoEntityMock.id },
        ]);

      await invitationsService.updateUserAssignedFolders(
        accountEntityMock.id,
        invitationEntityMock.id,
        [folderOneEntityMock.id, folderTwoEntityMock.id],
      );

      expect(
        invitationRepository.deleteFoldersOfAnInvitedUser,
      ).not.toHaveBeenCalled();
      expect(
        invitationRepository.addFoldersToAnInvitedUser,
      ).not.toHaveBeenCalled();
    });

    it('should retrieve folders and projects after adding new folders', async () => {
      jest
        .spyOn(
          invitationRepository,
          'retrieveFoldersAssignedToANonRegisteredUser',
        )
        .mockResolvedValueOnce([{ id: folderOneEntityMock.id }])
        .mockResolvedValueOnce([
          { id: folderOneEntityMock.id },
          { id: folderThreeEntityMock.id },
        ]);
      jest
        .spyOn(
          invitationRepository,
          'retrieveProjectsAssignedToANonRegisteredUser',
        )
        .mockResolvedValue([{ id: projectOneEntityMock.id }]);

      await invitationsService.updateUserAssignedFolders(
        accountEntityMock.id,
        invitationEntityMock.id,
        [folderOneEntityMock.id, folderThreeEntityMock.id],
      );

      expect(
        invitationRepository.addFoldersToAnInvitedUser,
      ).toHaveBeenCalledWith(invitationEntityMock.id, [
        folderThreeEntityMock.id,
      ]);
      expect(
        invitationRepository.retrieveFoldersAssignedToANonRegisteredUser,
      ).toHaveBeenCalledTimes(2);
      expect(
        invitationRepository.retrieveProjectsAssignedToANonRegisteredUser,
      ).toHaveBeenCalledWith(accountEntityMock.id, invitationEntityMock.id);
    });
  });
  //
  describe('create', () => {
    const payload: CreateInvitationType = {
      email: 'test@example.com',
      accountId: accountEntityMock.id,
      folderIds: [],
      projectIds: [],
      admin: {
        id: userEntityMock.id,
        username: userEntityMock.username,
        accounts: [
          { id: accountEntityMock.id, role: { ...roleAdminEntityMock } },
        ],
      },
      roleName: RoleEnum.Admin,
    };

    it('should throw an error if an invitation already exists', async () => {
      jest
        .spyOn(invitationRepository, 'getExistingInvitation')
        .mockResolvedValue({ ...invitationEntityMock });

      await expect(invitationsService.create(payload)).rejects.toThrow(
        BadRequestException,
      );

      expect(invitationRepository.getExistingInvitation).toHaveBeenCalledWith(
        'test@example.com',
        accountEntityMock.id,
      );
    });

    it('should send an invitation email to an existing user', async () => {
      jest
        .spyOn(invitationRepository, 'getExistingInvitation')
        .mockResolvedValue(null);
      jest.spyOn(accountsService, 'getExistingUserAccount').mockResolvedValue({
        id: accountEntityMock.id,
      } as any);
      jest
        .spyOn(rolesService, 'getRoleByName')
        .mockResolvedValue({ ...roleAdminEntityMock });
      jest
        .spyOn(usersService, 'getUser')
        .mockResolvedValue({ ...userEntityMock });
      jest.spyOn(usersService, 'getUserByEmailWithAccounts').mockResolvedValue({
        id: userEntityMock.id,
        accountUsers: [],
      } as any);
      jest
        .spyOn(accountLimitsService, 'accountingOfUsers')
        .mockResolvedValue(void 0);

      await invitationsService.create(payload);

      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendExistingUserInvitationEmail,
        expect.objectContaining({
          email: 'test@example.com',
          roleName: 'Admin',
        }),
      );
    });

    it('should send an invitation email to a new user without projects and folders', async () => {
      jest
        .spyOn(invitationRepository, 'getExistingInvitation')
        .mockResolvedValue(null);
      jest.spyOn(accountsService, 'getExistingUserAccount').mockResolvedValue({
        ...accountEntityMock,
      } as any);
      jest
        .spyOn(rolesService, 'getRoleByName')
        .mockResolvedValue({ ...roleAdminEntityMock });
      jest
        .spyOn(usersService, 'getUser')
        .mockResolvedValue({ ...userEntityMock });
      jest
        .spyOn(usersService, 'getUserByEmailWithAccounts')
        .mockResolvedValue(null);
      jest
        .spyOn(accountLimitsService, 'accountingOfUsers')
        .mockResolvedValue(void 0);

      await invitationsService.create({ ...payload });

      expect(mailingQueue.add).toHaveBeenCalledWith(
        QueueEventEnum.SendUserInvitationEmail,
        expect.objectContaining({
          email: payload.email,
          adminName: payload.admin.username,
        }),
      );
    });

    it('should process folder and project invitations correctly', async () => {
      jest
        .spyOn(invitationRepository, 'getExistingInvitation')
        .mockResolvedValue(null);
      jest.spyOn(accountsService, 'getExistingUserAccount').mockResolvedValue({
        ...accountEntityMock,
      } as any);
      jest
        .spyOn(rolesService, 'getRoleByName')
        .mockResolvedValue({ ...roleAdminEntityMock });
      jest
        .spyOn(usersService, 'getUser')
        .mockResolvedValue({ ...userEntityMock });
      jest
        .spyOn(usersService, 'getUserByEmailWithAccounts')
        .mockResolvedValue(null);
      jest
        .spyOn(foldersService, 'getFoldersWithChildFoldersAndProjects')
        .mockResolvedValue({
          folders: [{ ...folderOneEntityMock }],
          projects: [{ ...projectOneEntityMock }],
        });
      jest
        .spyOn(projectsService, 'getProjects')
        .mockResolvedValue([{ ...projectOneEntityMock }]);

      await invitationsService.create({
        ...payload,
        folderIds: [folderOneEntityMock.id],
        projectIds: [projectOneEntityMock.id],
      });

      expect(
        foldersService.getFoldersWithChildFoldersAndProjects,
      ).toHaveBeenCalledWith([folderOneEntityMock.id], accountEntityMock.id);
      expect(projectsService.getProjects).toHaveBeenCalledWith([
        projectOneEntityMock.id,
      ]);
      expect(invitationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          projectsInvitations: expect.arrayContaining([
            { ...projectOneEntityMock },
          ]),
          foldersInvitations: expect.arrayContaining([
            { ...folderOneEntityMock },
          ]),
        }),
      );
    });
  });
  //
});
