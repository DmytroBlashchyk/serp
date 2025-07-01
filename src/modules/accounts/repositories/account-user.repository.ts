import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { AccountUserEntity } from 'modules/accounts/entities/account-user.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { IdType } from 'modules/common/types/id-type.type';
import { GetPaginatedAccountUsersRequest } from 'modules/users/requests/get-paginated-account-users.request';
import { SortUsersEnum } from 'modules/users/enums/sort-users.enum';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { UserAccountType } from 'modules/accounts/types/user-account.type';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';

@Injectable()
@EntityRepository(AccountUserEntity)
export class AccountUserRepository extends BaseRepository<AccountUserEntity> {
  async deleteAllUsersAssignedToFolders(folderIds: IdType[]): Promise<void> {
    await this.query(
      `delete from users_folders where users_folders.folders_id in (${folderIds.map(
        (id) => id,
      )})`,
    );
    await this.query(
      `delete from folders_invitations where folders_id in (${folderIds.map(
        (id) => id,
      )})`,
    );
  }
  /**
   * Deletes all users assigned to the specified projects.
   *
   * @param {IdType[]} projectIds - The IDs of the projects whose users will be unassigned.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async deleteAllUsersAssignedToProjects(projectIds: IdType[]): Promise<void> {
    await this.query(
      `delete from users_projects where projects_id in (${projectIds.map(
        (id) => id,
      )})`,
    );
    await this.query(
      `delete from projects_invitations where projects_invitations.projects_id in (${projectIds.map(
        (id) => id,
      )})`,
    );
  }

  /**
   * Deletes all users assigned to the specified account.
   *
   * @param {IdType} accountId - The identifier of the account from which all users will be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteAllUsersAssignedToAccount(accountId: IdType): Promise<void> {
    await this.createQueryBuilder('account_users')
      .leftJoin('account_users.account', 'account')
      .where('account.id =:accountId', { accountId })
      .delete()
      .execute();
  }

  /**
   * Deletes all user accounts associated with the given user ID.
   *
   * @param {IdType} userId - The ID of the user whose accounts need to be deleted.
   * @return {Promise<void>} A promise that resolves when the deletion is complete.
   */
  async deleteAllUserAccountsUserId(userId: IdType): Promise<void> {
    await this.createQueryBuilder('account_users')
      .leftJoin('account_users.user', 'user')
      .where('user.id =:userId', { userId })
      .delete()
      .execute();
  }

  /**
   * Retrieves the users associated with a specific account.
   *
   * @param {IdType} accountId - The unique identifier for the account.
   * @return {Promise<AccountUserEntity[]>} A promise that resolves to an array of AccountUserEntity objects.
   */
  async getAccountUsers(accountId: IdType): Promise<AccountUserEntity[]> {
    return this.createQueryBuilder('account_users')
      .leftJoin('account_users.user', 'user')
      .leftJoin('account_users.account', 'account')
      .select(['account_users', 'user.id'])
      .where('account.id =:accountId', { accountId })
      .getMany();
  }

  /**
   * Fetches the IDs of the folders associated with a specific user and account.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} userId - The ID of the user.
   * @return {Promise<IdType[]>} A promise that resolves to an array of folder IDs.
   */
  async getIdsOfAccountUserFolders(
    accountId: IdType,
    userId: IdType,
  ): Promise<IdType[]> {
    const result = await this.query(
      `
select folders.id from users_folders
left join folders on users_folders.folders_id = folders.id
where users_folders.users_id = $1 and folders.account_id = $2 and folders.name != '${SystemFolderNamesEnum.MyFolders}'`,
      [userId, accountId],
    );
    return result.map((item: { id: IdType }) => item.id);
  }

  async getIdsOfAccountUserProjects(
    accountId: IdType,
    userId: IdType,
  ): Promise<IdType[]> {
    const result = await this.query(
      `
select projects.id::FLOAT from users_projects
left join projects on users_projects.projects_id = projects.id
where users_projects.users_id = $1 and projects.account_id = $2
    `,
      [userId, accountId],
    );
    return result.map((item: { id: IdType }) => item.id);
  }

  async addALinkBetweenFoldersAndUser(
    userId: IdType,
    folderIds: IdType[],
  ): Promise<void> {
    for (const folderId of folderIds) {
      await this.query(
        `INSERT INTO users_folders (folders_id, users_id) VALUES ($1, $2)
ON CONFLICT (users_id, folders_id) DO NOTHING`,
        [folderId, userId],
      );
    }
  }

  async addALinkBetweenProjectsAndUser(
    userId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    for (const projectId of projectIds) {
      await this.query(
        `INSERT INTO users_projects (projects_id, users_id) VALUES ($1, $2)
ON CONFLICT (user_id, folder_id) DO NOTHING`,
        [projectId, userId],
      );
    }
  }

  async removeLinkBetweenFoldersAndUser(
    userId: IdType,
    folderIds: IdType[],
  ): Promise<void> {
    for (const folderId of folderIds) {
      await this.query(
        `delete from users_folders where users_id = $1 and folders_id = $2`,
        [userId, folderId],
      );
    }
  }

  async removeLinkBetweenProjectsAndUser(
    userId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    for (const projectId of projectIds) {
      await this.query(
        `delete from users_projects where users_id = $1 and projects_id = $2`,
        [userId, projectId],
      );
    }
  }

  async getAnAccountByOwnerId(userId: IdType): Promise<AccountUserEntity> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .where('account_users.user_id =:userId and owner.id =:ownerId', {
        userId,
        ownerId: userId,
      })
      .getOne();
  }

  async getUserAccountByDefault(userId: IdType): Promise<AccountUserEntity> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .where(
        'account_users.user_id =:userId and account_users.by_default is true',
        { userId },
      )
      .getOne();
  }

  async getAccountUserWithRole(
    accountId: IdType,
    userId: IdType,
  ): Promise<AccountUserEntity> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account_users.user', 'user')
      .leftJoinAndSelect('account_users.role', 'role')
      .where('account.id =:accountId and user.id =:userId', {
        accountId,
        userId,
      })
      .getOne();
  }

  async getUserAccounts(userId: IdType): Promise<Array<AccountUserEntity>> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account_users.role', 'role')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('account.companyLogo', 'companyLogo')
      .leftJoinAndSelect('account.country', 'country')
      .leftJoinAndSelect('account.timezone', 'timezone')
      .where('account_users.user_id =:userId', { userId })
      .getMany();
  }

  async getUserAccountInfo(
    userId: IdType,
    accountId: IdType,
  ): Promise<UserAccountType> {
    const query = await this.query(
      `
select
    count(users.id)::FLOAT as users_count,
    (select COUNT(*)
     from invitations
     left join users on invitations.invitation_user = users.email
     where invitations.account_id = 1 and users is null
)::FLOAT as invitations_count,
(select COUNT(*) from projects
 left join users_projects on projects.id = users_projects.projects_id
 where projects.account_id = $2 and users_projects.users_id = $1
)::FLOAT as projects_count
from account_users
left join accounts on account_users.account_id = accounts.id
left join account_users as users on accounts.id = users.account_id
where account_users.user_id = $1 and account_users.account_id = $2
    `,
      [userId, accountId],
    );
    return query[0] ?? null;
  }

  async getAccountUser(
    accountId: IdType,
    userId: IdType,
  ): Promise<AccountUserEntity> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account_users.user', 'user')
      .where('account.id =:accountId and user.id =:userId', {
        accountId,
        userId,
      })
      .leftJoinAndSelect('account_users.role', 'role')
      .leftJoinAndSelect(
        'user.projects',
        'projects',
        'projects.account_id = :accountId',
        {
          accountId,
        },
      )
      .leftJoinAndSelect(
        'user.folders',
        'folders',
        'folders.account_id = :accountId',
        { accountId },
      )
      .getOne();
  }

  async getUserAccount(
    userId: IdType,
    accountId: IdType,
  ): Promise<AccountUserEntity> {
    return await this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('account.subscription', 'subscription')
      .leftJoinAndSelect('subscription.status', 'status')
      .leftJoinAndSelect('subscription.tariffPlanSetting', 'tariffPlanSetting')
      .leftJoinAndSelect(
        'tariffPlanSetting.tariffPlan',
        'subscriptionTariffPlan',
      )
      .leftJoinAndSelect('account.folders', 'folders')
      .leftJoinAndSelect('account.companyLogo', 'companyLogo')
      .leftJoinAndSelect('account.country', 'country')
      .leftJoinAndSelect('account.timezone', 'timezone')
      .leftJoinAndSelect('account.preferredTariffPlan', 'preferredTariffPlan')
      .leftJoinAndSelect('preferredTariffPlan.tariffPlan', 'tariffPlan')
      .loadRelationCountAndMap('account.usersCount', 'account.accountUsers')
      .loadRelationCountAndMap('account.projectCount', 'account.projects')
      .loadRelationCountAndMap('account.projectCount', 'account.projects')
      .where(
        'account_users.user_id =:userId and account_users.account_id =:accountId',
        { userId, accountId },
      )
      .getOne();
  }

  async getAccountsByUserIdAndAccountIds(
    userId: IdType,
    accountIds: IdType[],
  ): Promise<AccountUserEntity[]> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('account_users.role', 'role')
      .where(
        'account_users.user_id =:userId and account_users.account_id IN(:...accountIds)',
        { userId, accountIds },
      )
      .getMany();
  }

  async getAccountUsersWithUserByAccountIdAndUserIds(
    accountId: IdType,
    userIds: IdType[],
  ): Promise<Array<AccountUserEntity>> {
    return this.createQueryBuilder('account_users')
      .where('account_id =:accountId and user_id in(:...userIds)', {
        accountId,
        userIds,
      })
      .leftJoinAndSelect('account_users.user', 'user')
      .getMany();
  }

  async getAccountUserWithUserByAccountIdAndUserId(
    accountId: IdType,
    userId: IdType,
  ): Promise<AccountUserEntity> {
    return this.createQueryBuilder('account_users')
      .withDeleted()
      .leftJoinAndSelect('account_users.account', 'account')
      .leftJoinAndSelect('account.subscription', 'subscription')
      .leftJoinAndSelect('account_users.role', 'role')
      .leftJoinAndSelect('account.owner', 'owner')
      .leftJoinAndSelect('account_users.user', 'user')
      .leftJoinAndSelect('user.projects', 'projects')
      .where(
        'account_users.account_id =:accountId and account_users.user_id =:userId',
        {
          accountId,
          userId,
        },
      )
      .getOne();
  }
}
