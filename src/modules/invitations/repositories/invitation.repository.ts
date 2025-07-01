import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { InvitationEntity } from 'modules/invitations/entities/invitation.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(InvitationEntity)
export class InvitationRepository extends BaseRepository<InvitationEntity> {
  /**
   * Deletes invitations that are not associated with any projects or folders.
   *
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteInvitationsWithoutProjectsAndFolders() {
    await this.query(`delete from invitations where id in (
select result.id from (
select count(projects_invitations) as count_projects, count(folders_invitations) as count_folders, invitations.id from invitations
left join projects_invitations on invitations.id = projects_invitations.invitations_id
left join folders_invitations on invitations.id = folders_invitations.invitations_id
group by invitations.id) as result
where result.count_folders = 0 and result.count_projects = 0)`);
  }

  /**
   * Retrieves a list of users who manage a specific folder.
   *
   * @param {IdType} folderId - The identifier of the folder.
   * @return {Promise<{ id: IdType }[]>} A promise that resolves to an array of objects, each containing a user ID.
   */
  async getUsersWhoManageFolder(folderId: IdType): Promise<{ id: IdType }[]> {
    return this.query(
      `select users_folders.users_id as id from users_folders where folders_id = $1`,
      [folderId],
    );
  }

  /**
   * Fetches a list of invitations assigned to a specific folder.
   *
   * @param {IdType} folderId - The unique identifier of the folder.
   * @return {Promise<{ id: IdType }[]>} A promise that resolves to an array of objects, each containing an invitation ID.
   */
  async getInvitationsAssignedToFolder(
    folderId: IdType,
  ): Promise<{ id: IdType }[]> {
    return this.query(
      `select folders_invitations.invitations_id as id from folders_invitations where folders_id = $1`,
      [folderId],
    );
  }

  /**
   * Adds folders to an invited user based on the provided invitation ID.
   *
   * @param {IdType} invitationId - The unique identifier for the invitation.
   * @param {IdType[]} folderIds - An array of unique identifiers for the folders.
   * @return {Promise<void>} - A promise that resolves when the folders have been added to the invited user.
   */
  async addFoldersToAnInvitedUser(
    invitationId: IdType,
    folderIds: IdType[],
  ): Promise<void> {
    await this.query(
      `INSERT INTO folders_invitations (invitations_id, folders_id)
SELECT $1, unnest(array[${folderIds.map((item) => item)}])
ON CONFLICT (invitations_id, folders_id) DO NOTHING`,
      [invitationId],
    );
  }

  /**
   * Deletes folders associated with an invited user based on the invitation ID and folder IDs provided.
   *
   * @param {IdType} invitationId - The ID of the invitation associated with the user.
   * @param {IdType[]} folderIds - An array of folder IDs to be deleted.
   * @return {Promise<void>} - A promise that resolves when the folders are successfully deleted.
   */
  async deleteFoldersOfAnInvitedUser(
    invitationId: IdType,
    folderIds: IdType[],
  ): Promise<void> {
    await this.query(
      `delete from folders_invitations where invitations_id = $1 and folders_id in (${folderIds.map(
        (id) => id,
      )})`,
      [invitationId],
    );
  }

  /**
   * This method retrieves folders assigned to a non-registered user.
   *
   * @param {IdType} accountId - The ID of the account to which the folders belong.
   * @param {IdType} invitationId - The ID of the invitation associated with the non-registered user.
   * @return {Promise<{ id: IdType }[]>} A promise that resolves to an array of objects, each containing the ID of a folder.
   */
  async retrieveFoldersAssignedToANonRegisteredUser(
    accountId: IdType,
    invitationId: IdType,
  ): Promise<{ id: IdType }[]> {
    return this.query(
      `select folders.id from folders_invitations 
left join folders on folders_invitations.folders_id = folders.id
where invitations_id = $1 and folders.account_id = $2`,
      [invitationId, accountId],
    );
  }

  /**
   * Adds projects to an invited user using their invitation ID.
   *
   * @param {IdType} invitationId - The ID of the invitation.
   * @param {IdType[]} projectIds - An array of project IDs to add to the invitation.
   * @return {Promise<void>} A promise that resolves when the projects have been successfully added.
   */
  async addProjectsToAnInvitedUser(
    invitationId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    await this.query(
      `INSERT INTO projects_invitations (invitations_id, projects_id)
SELECT $1, unnest(array[${projectIds.map((item) => item)}])
ON CONFLICT (invitations_id, projects_id) DO NOTHING`,
      [invitationId],
    );
  }

  /**
   * Deletes projects associated with a specific invited user.
   *
   * @param {IdType} invitationId - The identifier of the invitation.
   * @param {IdType[]} projectIds - An array of project identifiers to be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteProjectsOfAnInvitedUser(
    invitationId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    await this.query(
      `delete from projects_invitations 
where invitations_id = $1 and projects_id in (${projectIds.map(
        (item) => item,
      )})`,
      [invitationId],
    );
  }

  /**
   * Retrieves projects assigned to a non-registered user based on their account ID and invitation ID.
   *
   * @param {IdType} accountId - The account ID of the user.
   * @param {IdType} invitationId - The invitation ID assigned to the user.
   * @return {Promise<{id: IdType}[]>} A promise that resolves to an array of project IDs associated with the given invitation and account.
   */
  async retrieveProjectsAssignedToANonRegisteredUser(
    accountId: IdType,
    invitationId: IdType,
  ): Promise<{ id: IdType }[]> {
    return this.query(
      `select projects.id from projects_invitations 
left join projects on projects_invitations.projects_id = projects.id
where invitations_id = $1 and projects.account_id = $2`,
      [invitationId, accountId],
    );
  }

  /**
   * Retrieves an invitation entity along with its associated projects and folders
   * for a specific account.
   *
   * @param {IdType} invitationId - The unique identifier for the invitation.
   * @param {IdType} accountId - The unique identifier for the account.
   * @return {Promise<InvitationEntity>} A promise that resolves to the invitation entity.
   */
  getInvitationAnAccountWithProjectsAndFolders(
    invitationId: IdType,
    accountId: IdType,
  ): Promise<InvitationEntity> {
    return this.createQueryBuilder('invitations')
      .withDeleted()
      .leftJoin('invitations.account', 'account')
      .leftJoinAndSelect('invitations.role', 'role')
      .leftJoinAndSelect(
        'invitations.projectsInvitations',
        'projectsInvitations',
      )
      .leftJoin(
        'projectsInvitations.account',
        'projectAccount',
        'projectAccount.id =:accountId',
        { accountId },
      )
      .leftJoinAndSelect('invitations.foldersInvitations', 'foldersInvitations')
      .leftJoin(
        'foldersInvitations.account',
        'folderAccount',
        'folderAccount.id =:accountId',
        { accountId },
      )
      .where('invitations.id =:invitationId and account.id =:accountId', {
        invitationId,
        accountId,
      })
      .getOne();
  }

  /**
   * Retrieves an invitation by its ID, including related entities such as account,
   * projects invitations, and folders invitations. The search includes soft-deleted records.
   *
   * @param {IdType} id - The unique identifier of the invitation to retrieve.
   * @return {Promise<InvitationEntity>} A promise that resolves to the invitation entity with the specified ID.
   */
  async getInvitationById(id: IdType): Promise<InvitationEntity> {
    return this.createQueryBuilder('invitations')
      .withDeleted()
      .leftJoinAndSelect('invitations.account', 'account')
      .leftJoinAndSelect(
        'invitations.projectsInvitations',
        'projectsInvitations',
      )
      .leftJoinAndSelect('invitations.foldersInvitations', 'foldersInvitations')
      .where('invitations.id =:id', { id })
      .getOne();
  }

  /**
   * Removes invitations from the database based on the specified invitation users and account ID.
   *
   * @param {string[]} invitationUsers - The array of invitation user identifiers to be removed.
   * @param {IdType} accountId - The unique identifier for the account associated with the invitations to be removed.
   * @return {Promise<void>} A promise that resolves once the invitations have been deleted from the database.
   */
  async removeInvitationsByInvitationUsersAndAccountId(
    invitationUsers: string[],
    accountId: IdType,
  ): Promise<void> {
    await this.createQueryBuilder('invitations')
      .where(
        'invitations.account_id =:accountId and invitations.invitation_user in(:...invitationUsers)',
        { accountId, invitationUsers },
      )
      .delete()
      .execute();
  }
  /**
   * Removes an invitation using the invitation user and account ID.
   *
   * @param {string} invitationUser - The invitation user identifier.
   * @param {IdType} accountId - The account ID associated with the invitation.
   * @return {Promise<void>} A promise that resolves when the invitation is removed.
   */
  async removeInvitationByInvitationUserAndAccountId(
    invitationUser: string,
    accountId: IdType,
  ): Promise<void> {
    await this.createQueryBuilder('invitations')
      .where(
        'invitations.invitation_user =:invitationUser and account_id =:accountId',
        {
          invitationUser,
          accountId,
        },
      )
      .delete()
      .execute();
  }

  /**
   * Removes invitations based on the provided invitation IDs and account ID.
   *
   * @param {IdType[]} invitationIds - An array of invitation IDs to be removed.
   * @param {IdType} accountId - The account ID associated with the invitations.
   * @return {Promise<void>} A promise that resolves when the invitations are removed.
   */
  async removeInvitationsByInvitationIdAndAccountId(
    invitationIds: IdType[],
    accountId: IdType,
  ): Promise<void> {
    await this.createQueryBuilder('invitations')
      .where(
        'invitations.id in(:...invitationIds) and account_id =:accountId',
        {
          invitationIds,
          accountId,
        },
      )
      .delete()
      .execute();
  }

  /**
   * Retrieves a list of invitations associated with a specific user.
   *
   * @param {string} invitationUser - The user associated with the invitations.
   * @return {Promise<Array<InvitationEntity>>} A promise that resolves to an array of InvitationEntity objects.
   */
  async getInvitationsByInvitationUser(
    invitationUser: string,
  ): Promise<Array<InvitationEntity>> {
    return this.createQueryBuilder('invitations')
      .withDeleted()
      .leftJoinAndSelect('invitations.role', 'role')
      .leftJoinAndSelect('invitations.user', 'user')
      .leftJoinAndSelect('invitations.account', 'account')
      .leftJoinAndSelect(
        'invitations.projectsInvitations',
        'projectsInvitations',
      )
      .leftJoinAndSelect('projectsInvitations.users', 'users')
      .leftJoinAndSelect('invitations.foldersInvitations', 'foldersInvitations')
      .leftJoinAndSelect('foldersInvitations.users', 'folderUsers')
      .where('invitation_user =:invitationUser', {
        invitationUser,
      })
      .getMany();
  }
  /**
   * Retrieves an existing invitation for a given email and account ID.
   *
   * @param {string} email - The email address of the user associated with the invitation.
   * @param {IdType} accountId - The ID of the account to which the invitation is associated.
   * @return {Promise<InvitationEntity>} - A promise that resolves to the invitation details if found.
   */
  async getExistingInvitation(
    email: string,
    accountId: IdType,
  ): Promise<InvitationEntity> {
    return this.createQueryBuilder('invitations')
      .where('invitation_user =:email and account_id =:accountId', {
        email,
        accountId,
      })
      .getOne();
  }
}
