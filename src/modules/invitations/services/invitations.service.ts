import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateInvitationType } from 'modules/invitations/types/create-invitation.type';
import { InvitationRepository } from 'modules/invitations/repositories/invitation.repository';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { RolesService } from 'modules/users/services/roles.service';
import { UsersService } from 'modules/users/services/users.service';
import { FoldersService } from 'modules/folders/services/folders.service';
import { ProjectsService } from 'modules/projects/services/projects.service';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { IdType } from 'modules/common/types/id-type.type';
import { AccountLimitsService } from 'modules/account-limits/services/account-limits.service';
import { UpdateInvitationType } from 'modules/invitations/types/update-invitation.type';
import { GetInvitationType } from 'modules/invitations/types/get-invitation.type';
import { InvitationResponseFactory } from 'modules/invitations/factories/invitation-response.factory';
import { GetInvitedUserType } from 'modules/invitations/types/get-invited-user.type';
import { AccountUsersService } from 'modules/accounts/services/account-users.service';
import { InvitedUserResponseFactory } from 'modules/invitations/factories/invited-user-response.factory';
import { InvitedUserResponse } from 'modules/invitations/responses/invited-user.response';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class InvitationsService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly accountsService: AccountsService,
    private readonly rolesService: RolesService,
    private readonly usersService: UsersService,
    private readonly foldersService: FoldersService,
    private readonly projectsService: ProjectsService,
    @InjectQueue(Queues.Mailing)
    private readonly mailingQueue: Queue,
    private readonly accountLimitsService: AccountLimitsService,
    private readonly invitationResponseFactory: InvitationResponseFactory,
    private readonly accountUsersService: AccountUsersService,
    private readonly invitedUserResponseFactory: InvitedUserResponseFactory,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Updates an invitation with provided payload data. This includes updating roles, projects, and folders associated
   * with the invitation. Raises an event to refresh the folder tree after completing updates.
   *
   * @param {UpdateInvitationType} payload - The payload containing updated information for the invitation.
   * @param {string} payload.id - The ID of the invitation to update.
   * @param {string} [payload.roleName] - The optional new role name for the invitation.
   * @param {string} payload.accountId - The account ID associated with the invitation.
   * @param {string[]} [payload.projectIds] - The optional list of new project IDs to associate with the invitation.
   * @param {string[]} [payload.folderIds] - The optional list of new folder IDs to associate with the invitation.
   * @returns {Promise<void>} A promise that resolves when the update operation is complete.
   * @throws {NotFoundException} If the invitation is not found.
   */
  @Transactional()
  async update(payload: UpdateInvitationType): Promise<void> {
    const invitation = await this.invitationRepository.getInvitationById(
      payload.id,
    );
    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }
    if (payload.roleName) {
      const role = await this.rolesService.getRoleByName(payload.roleName);
      await this.invitationRepository.save({ ...invitation, role });
    }

    await this.updateProjectsAssignedToUser(
      payload.accountId,
      invitation.id,
      payload.projectIds,
    );
    await this.updateUserAssignedFolders(
      payload.accountId,
      invitation.id,
      payload.folderIds,
    );

    await this.invitationRepository.deleteInvitationsWithoutProjectsAndFolders();

    this.eventBus.publish(
      new RefreshFolderTreeEvent({ accountId: payload.accountId }),
    );
  }

  /**
   * Updates the projects assigned to a user by first retrieving the current assigned projects,
   * then determining which projects to add or remove based on the provided new project IDs,
   * and finally making the necessary updates in the repository.
   *
   * @param {IdType} accountId - The ID of the account associated with the user.
   * @param {IdType} invitationId - The ID of the invitation related to the user.
   * @param {IdType[]} newProjectIds - The new list of project IDs to be assigned to the user.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updateProjectsAssignedToUser(
    accountId: IdType,
    invitationId: IdType,
    newProjectIds: IdType[],
  ): Promise<void> {
    const projectIds =
      await this.invitationRepository.retrieveProjectsAssignedToANonRegisteredUser(
        accountId,
        invitationId,
      );

    const arrayIds = projectIds.map((item) => item.id);
    const deletedIds = arrayIds.filter((id) => !newProjectIds.includes(id));
    const insertIds = newProjectIds.filter((id) => !arrayIds.includes(id));
    if (deletedIds.length > 0) {
      await this.invitationRepository.deleteProjectsOfAnInvitedUser(
        invitationId,
        deletedIds,
      );
    }
    if (insertIds.length > 0) {
      await this.invitationRepository.addProjectsToAnInvitedUser(
        invitationId,
        insertIds,
      );
    }
  }
  /**
   * Updates the folders assigned to an invitation for a non-registered user.
   *
   * @param {IdType} accountId The account ID to which the invitation belongs.
   * @param {IdType} invitationId The invitation ID for the non-registered user.
   * @param {IdType[]} newFolderIds Array of the new folder IDs to be assigned to the invitation.
   * @return {Promise<void>} A promise that resolves when the update operation is complete.
   */
  async updateUserAssignedFolders(
    accountId: IdType,
    invitationId: IdType,
    newFolderIds: IdType[],
  ) {
    const folders =
      await this.invitationRepository.retrieveFoldersAssignedToANonRegisteredUser(
        accountId,
        invitationId,
      );
    const arrayIds = folders.map((item) => item.id);
    const deletedIds = arrayIds.filter((id) => !newFolderIds.includes(id));
    const insertIds = newFolderIds.filter((id) => !arrayIds.includes(id));
    if (deletedIds.length > 0) {
      await this.invitationRepository.deleteFoldersOfAnInvitedUser(
        invitationId,
        deletedIds,
      );
    }
    if (insertIds.length > 0) {
      await this.invitationRepository.addFoldersToAnInvitedUser(
        invitationId,
        insertIds,
      );
      const folders =
        await this.invitationRepository.retrieveFoldersAssignedToANonRegisteredUser(
          accountId,
          invitationId,
        );
      const projectIds =
        await this.invitationRepository.retrieveProjectsAssignedToANonRegisteredUser(
          accountId,
          invitationId,
        );
      for (const folder of folders) {
        break;
      }
    }
  }
  /**
   * Retrieves a list of invitations for a specified user.
   *
   * @param {string} userEmail - The email address of the user whose invitations are to be fetched.
   * @return {Array} An array of invitations associated with the specified user.
   */
  getUserInvitations(userEmail: string) {
    return this.invitationRepository.getInvitationsByInvitationUser(userEmail);
  }

  /**
   * Merges two arrays of ProjectEntity objects and removes any duplicates based on the 'id' property.
   *
   * @param {ProjectEntity[]} arr1 - The first array of ProjectEntity objects.
   * @param {ProjectEntity[]} arr2 - The second array of ProjectEntity objects.
   * @return {Promise<ProjectEntity[]>} A promise that resolves to an array of unique ProjectEntity objects.
   */
  async mergeAndRemoveDuplicates(
    arr1: ProjectEntity[],
    arr2: ProjectEntity[],
  ): Promise<ProjectEntity[]> {
    const mergedArray = [...arr1, ...arr2];

    const uniqueIds = new Set();

    return mergedArray.filter((obj) => {
      if (!uniqueIds.has(obj.id)) {
        uniqueIds.add(obj.id);
        return true;
      }
      return false;
    });
  }

  /**
   * Retrieves an invited user's details based on the provided payload.
   *
   * @param {GetInvitedUserType} payload - The payload containing the accountId and userId to identify the user.
   * @return {Promise<InvitedUserResponse>} A promise that resolves to the response with the invited user's details.
   * @throws {NotFoundException} Throws an exception if the user is not found.
   */
  async getInvitedUser(
    payload: GetInvitedUserType,
  ): Promise<InvitedUserResponse> {
    const user = await this.accountUsersService.getAccountUser(
      payload.accountId,
      payload.userId,
    );
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return this.invitedUserResponseFactory.createResponse(user);
  }

  /**
   * Retrieves an invitation along with associated projects and folders based on the provided payload,
   * which contains the invitation ID and account ID.
   *
   * @param {GetInvitationType} payload - The payload containing the invitation and account identifiers.
   * @return {Promise<Object>} - A promise that resolves to the invitation response object.
   * @throws {NotFoundException} - Throws an error if the invitation is not found.
   */
  async getInvitation(payload: GetInvitationType) {
    const invitation =
      await this.invitationRepository.getInvitationAnAccountWithProjectsAndFolders(
        payload.invitationId,
        payload.accountId,
      );

    if (!invitation) {
      throw new NotFoundException('Invitation not found.');
    }
    return this.invitationResponseFactory.createResponse(invitation);
  }

  /**
   * Creates a new invitation based on the provided payload.
   *
   * @param {CreateInvitationType} payload - The data required to create an invitation, including email, account ID, admin details, role name, folder IDs, and project IDs.
   * @return {Promise<void>} - A promise that resolves when the invitation has been successfully created.
   * @throws {BadRequestException} - If an invitation has already been sent or the user is already invited to the account.
   */
  @Transactional()
  async create(payload: CreateInvitationType): Promise<void> {
    const existingInvitation =
      await this.invitationRepository.getExistingInvitation(
        payload.email,
        payload.accountId,
      );

    if (existingInvitation) {
      throw new BadRequestException('An invitation has been sent before');
    }

    const userAccount = await this.accountsService.getExistingUserAccount(
      payload.admin.id,
      payload.accountId,
    );
    const role = await this.rolesService.getRoleByName(payload.roleName);
    const user = await this.usersService.getUser(payload.admin.id);
    const invitationUser = await this.usersService.getUserByEmailWithAccounts(
      payload.email,
    );

    let projects: ProjectEntity[] = [];
    if (invitationUser) {
      if (
        invitationUser.accountUsers.find(
          (accountUser) => accountUser.account.id === userAccount.id,
        )
      ) {
        throw new BadRequestException(
          'The user has already been invited to the account.',
        );
      } else {
        let data;
        if (payload?.folderIds?.length) {
          data =
            await this.foldersService.getFoldersWithChildFoldersAndProjects(
              payload.folderIds,
              payload.accountId,
            );
        }

        if (payload.projectIds?.length) {
          projects = await this.projectsService.getProjects(payload.projectIds);
        }
        if (data && data.projects.length > 0) {
          projects = await this.mergeAndRemoveDuplicates(
            projects,
            data.projects,
          );
        }

        await this.invitationRepository.save({
          invitationUser: payload.email,
          role,
          user,
          account: userAccount,
        });

        await this.accountLimitsService.accountingOfUsers(payload.accountId, 1);
        await this.projectsService.addUserToProjects(invitationUser, projects);

        if (data && data.folders.length > 0) {
          await this.foldersService.addUserToFolders(
            invitationUser,
            data.folders,
          );
        }

        await this.accountsService.addUserToAccount(
          invitationUser,
          userAccount,
          role,
        );
      }

      await this.mailingQueue.add(
        QueueEventEnum.SendExistingUserInvitationEmail,
        {
          email: payload.email,
          adminName: payload.admin.username,
          roleName: payload.roleName,
          firstName: invitationUser.firstName,
        },
      );
    } else {
      if (payload?.folderIds?.length) {
        const data =
          await this.foldersService.getFoldersWithChildFoldersAndProjects(
            payload.folderIds,
            payload.accountId,
          );
        if (payload?.projectIds?.length) {
          projects = await this.projectsService.getProjects(payload.projectIds);
        }
        if (data?.projects.length > 0) {
          projects = await this.mergeAndRemoveDuplicates(
            projects,
            data.projects,
          );
        }
        await this.invitationRepository.save({
          invitationUser: payload.email,
          role,
          user,
          account: userAccount,
          projectsInvitations: projects,
          foldersInvitations: data.folders,
        });
      } else {
        if (payload?.projectIds?.length) {
          projects = await this.projectsService.getProjects(payload.projectIds);
          await this.invitationRepository.save({
            invitationUser: payload.email,
            role,
            user,
            account: userAccount,
            projectsInvitations: projects,
          });
        }
      }

      await this.accountLimitsService.accountingOfInvitations(
        payload.accountId,
        1,
      );
      await this.mailingQueue.add(QueueEventEnum.SendUserInvitationEmail, {
        email: payload.email,
        adminName: payload.admin.username,
      });
    }
  }

  /**
   * Removes a bulk of invitations and updates related account limits.
   *
   * @param {IdType[]} invitationIds - An array of invitation IDs to be removed.
   * @param {IdType} accountId - The account ID associated with the given invitations.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  @Transactional()
  async bulkRemove(invitationIds: IdType[], accountId: IdType): Promise<void> {
    await this.invitationRepository.removeInvitationsByInvitationIdAndAccountId(
      invitationIds,
      accountId,
    );

    await this.accountLimitsService.accountingOfInvitations(
      accountId,
      invitationIds.length * -1,
    );
    this.eventBus.publish(new RefreshFolderTreeEvent({ accountId }));
  }
}
