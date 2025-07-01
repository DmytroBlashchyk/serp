import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { UserRepository } from 'modules/users/repositories/user.repository';
import { CryptoUtilsService } from 'modules/common/services/crypto-utils.service';
import { StatusResponse } from 'modules/common/responses/status.response';
import { EditUserType } from 'modules/users/types/edit-user.type';
import { AccountsService } from 'modules/accounts/services/accounts.service';
import { IdType } from 'modules/common/types/id-type.type';
import { UserEntity } from 'modules/users/entities/user.entity';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { FoldersService } from 'modules/folders/services/folders.service';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cryptoUtilService: CryptoUtilsService,
    private readonly accountsService: AccountsService,
    private readonly foldersService: FoldersService,
    private readonly eventBus: EventBus,
  ) {}

  /**
   * Retrieves a user by their email address, including associated account information.
   *
   * @param {string} email - The email address of the user to retrieve.
   * @return {Promise<UserEntity>} A promise that resolves to the UserEntity including account information.
   */
  async getUserByEmailWithAccounts(email: string): Promise<UserEntity> {
    return this.userRepository.getUserByEmail(email);
  }

  /**
   * Updates the list of projects assigned to a user by synchronizing the provided list of new project IDs.
   *
   * @param {IdType} accountId - The ID of the account to which the user belongs.
   * @param {IdType} userId - The ID of the user whose project assignments are being updated.
   * @param {IdType[]} newProjectIds - The list of new project IDs to be assigned to the user.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  private async updateProjectsAssignedToUser(
    accountId: IdType,
    userId: IdType,
    newProjectIds: IdType[],
  ): Promise<void> {
    const projectIds = await this.userRepository.getInvitedUserProjects(
      accountId,
      userId,
    );

    const arrayIds = projectIds.map((item) => item.id);
    const deletedIds = arrayIds.filter((id) => !newProjectIds.includes(id));
    const insertIds = newProjectIds.filter((id) => !arrayIds.includes(id));
    if (deletedIds.length > 0) {
      await this.userRepository.deleteProjectsOfAnInvitedUser(
        userId,
        deletedIds,
      );
    }
    if (insertIds.length > 0) {
      await this.userRepository.addProjectsToAnInvitedUser(userId, insertIds);
    }
  }

  /**
   * Updates the folders assigned to a user based on the given folder IDs.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} userId - The ID of the user.
   * @param {IdType[]} newFolderIds - An array of folder IDs to be assigned to the user.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  private async updateUserAssignedFolders(
    accountId: IdType,
    userId: IdType,
    newFolderIds: IdType[],
  ): Promise<void> {
    const folders = await this.userRepository.getInvitedUserFolders(
      accountId,
      userId,
    );
    const arrayIds = folders.map((item) => item.id);
    const deletedIds = arrayIds.filter((id) => !newFolderIds.includes(id));
    const insertIds = newFolderIds.filter((id) => !arrayIds.includes(id));
    if (deletedIds.length > 0) {
      await this.userRepository.deleteFoldersOfAnInvitedUser(
        userId,
        deletedIds,
      );
    }
    if (insertIds.length > 0) {
      const data =
        await this.foldersService.getFoldersWithChildFoldersAndProjects(
          insertIds,
          accountId,
        );
      if (data.folders.length > 0) {
        await this.userRepository.addFoldersToAnInvitedUser(
          userId,
          data.folders.map((folder) => folder.id),
        );
      }
      if (data.projects.length > 0) {
        await this.userRepository.addProjectsToAnInvitedUser(
          userId,
          data.projects.map((project) => project.id),
        );
      }
    }
  }

  /**
   * Edits the user's information, including updating assigned projects and folders.
   *
   * @param {EditUserType} userEditPayload - The payload containing user edit information including account ID, user ID, project IDs, and folder IDs.
   * @return {Promise<void>} A promise that resolves when the user's information has been successfully edited.
   */
  @Transactional()
  async editUser(userEditPayload: EditUserType): Promise<void> {
    await this.accountsService.changeUserAccount(userEditPayload);

    await this.updateProjectsAssignedToUser(
      userEditPayload.accountId,
      userEditPayload.userId,
      userEditPayload.projectIds,
    );
    await this.updateUserAssignedFolders(
      userEditPayload.accountId,
      userEditPayload.userId,
      userEditPayload.folderIds,
    );
    this.eventBus.publish(
      new RefreshFolderTreeEvent({ accountId: userEditPayload.accountId }),
    );
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @param {IdType} id - The unique identifier of the user.
   * @return {Promise<UserEntity>} A promise that resolves to the user entity if found.
   * @throws {NotFoundException} If no user is found with the given identifier.
   */
  async getUser(id: IdType): Promise<UserEntity> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    return user;
  }

  /**
   * Confirms the user password for the given account.
   *
   * @param {IdType} accountId - The ID of the account to be confirmed.
   * @param {UserPayload} userPayload - The payload containing user details.
   * @param {string} password - The password to be confirmed.
   * @return {Promise<StatusResponse>} - A promise that resolves to a status response indicating whether the password confirmation was successful.
   */
  async passwordConfirmation(
    accountId: IdType,
    userPayload: UserPayload,
    password: string,
  ): Promise<StatusResponse> {
    const userAccount =
      await this.accountsService.getUserAndAccountByUserIdAndAccountId(
        userPayload.id,
        accountId,
      );

    if (!userAccount || userAccount.account.owner.id !== userPayload.id) {
      throw new NotFoundException('Access denied');
    }

    const passwordMatched = await this.cryptoUtilService.verifyPasswordHash(
      password,
      userAccount.account.owner.password,
    );
    if (!passwordMatched) {
      return new StatusResponse({
        status: false,
      });
    }

    return new StatusResponse({
      status: true,
    });
  }
}
