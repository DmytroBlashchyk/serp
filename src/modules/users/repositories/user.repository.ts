import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { UserEntity } from 'modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { EntityManager, EntityRepository } from 'typeorm';
import { RoleRepository } from 'modules/auth/repositories/role.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { GetUserProjectType } from 'modules/users/types/get-user-project.type';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';
import { GetUserFolderType } from 'modules/users/types/get-user-folder.type';
import { FolderEntity } from 'modules/folders/entities/folder.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';

@Injectable()
@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity> {
  private readonly roleRepository: RoleRepository;
  constructor(entityManager: EntityManager) {
    super();
    this.roleRepository = entityManager.getCustomRepository(RoleRepository);
  }

  /**
   * Adds specified folders to an invited user.
   *
   * @param {IdType} userId - The ID of the user to which the folders will be added.
   * @param {IdType[]} folderIds - An array of folder IDs to be added to the user.
   * @return {Promise<void>} A promise that resolves when the folders have been successfully added.
   */
  async addFoldersToAnInvitedUser(
    userId: IdType,
    folderIds: IdType[],
  ): Promise<void> {
    await this.query(
      `INSERT INTO users_folders (users_id, folders_id)
   SELECT $1, unnest(array[${folderIds.map((item) => item)}])
   ON CONFLICT (users_id, folders_id) DO NOTHING`,
      [userId],
    );
  }

  /**
   * Adds multiple projects to an invited user by inserting records into the users_projects table.
   * If the relationship between the user and a project already exists, it will be ignored due to the conflict handling.
   *
   * @param {IdType} userId - The unique identifier of the user.
   * @param {IdType[]} projectIds - An array of unique identifiers of the projects to be added for the user.
   * @return {Promise<void>} A promise that resolves when the projects have been successfully added to the user.
   */
  async addProjectsToAnInvitedUser(
    userId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    await this.query(
      `INSERT INTO users_projects (users_id, projects_id)
SELECT $1, unnest(array[${projectIds.map((item) => item)}])
ON CONFLICT (users_id, projects_id) DO NOTHING`,
      [userId],
    );
  }

  /**
   * Deletes folders associated with an invited user.
   *
   * @param {IdType} userId - The identifier of the user whose folders are to be deleted.
   * @param {IdType[]} folderIds - An array of folder identifiers to be deleted.
   * @return {Promise<void>} - A promise that resolves when the operation is complete.
   */
  async deleteFoldersOfAnInvitedUser(
    userId: IdType,
    folderIds: IdType[],
  ): Promise<void> {
    await this.query(
      `delete from users_folders where users_id = $1 and folders_id in (${folderIds.map(
        (id) => id,
      )})`,
      [userId],
    );
  }

  /**
   * Deletes the projects associated with an invited user.
   *
   * @param {IdType} userId - The ID of the user whose projects need to be deleted.
   * @param {IdType[]} projectIds - An array of project IDs to be deleted for the specified user.
   * @return {Promise<void>} A promise that resolves when the projects are successfully deleted.
   */
  async deleteProjectsOfAnInvitedUser(
    userId: IdType,
    projectIds: IdType[],
  ): Promise<void> {
    await this.query(
      `delete from users_projects 
where users_id = $1 and projects_id in (${projectIds.map((item) => item)})`,
      [userId],
    );
  }

  /**
   * Retrieves the folders a user has been invited to within a specific account.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} userId - The ID of the user.
   * @return {Promise<FolderEntity[]>} - A promise that resolves to a list of folder entities.
   */
  async getInvitedUserFolders(
    accountId: IdType,
    userId: IdType,
  ): Promise<FolderEntity[]> {
    const user = await this.createQueryBuilder('users')
      .where('users.id =:userId', { userId })
      .leftJoinAndSelect('users.folders', 'folders')
      .andWhere('folders.account_id =:accountId', {
        accountId,
      })
      .getOne();
    return user?.folders.length > 0 ? user.folders : [];
  }

  /**
   * Retrieves a list of project IDs where a specified user is invited in the context of a specific account.
   *
   * @param {IdType} accountId - The ID of the account to which the projects belong.
   * @param {IdType} userId - The ID of the user for whom the projects are being retrieved.
   * @return {Promise<{ id: IdType }[]>} A promise that resolves to an array of objects containing project IDs.
   */
  async getInvitedUserProjects(
    accountId: IdType,
    userId: IdType,
  ): Promise<{ id: IdType }[]> {
    return this.query(
      `select projects.id from users_projects
left join projects on users_projects.projects_id = projects.id
where users_id = $1 and projects.account_id = $2`,
      [userId, accountId],
    );
  }

  /**
   * Retrieves a user by their unique identifier.
   *
   * @param {IdType} id - The unique identifier of the user.
   * @return {Promise<UserEntity>} A promise that resolves to the user entity.
   */
  async getUserById(id: IdType): Promise<UserEntity> {
    return this.createQueryBuilder('users')
      .where('users.id =:id', { id })
      .getOne();
  }

  /**
   * Deletes users with the specified IDs from the database.
   *
   * @param {IdType[]} userIds - An array of user IDs to delete.
   * @return {Promise<void>} A promise that resolves when the users have been deleted.
   */
  async deleteUsersByIds(userIds: IdType[]): Promise<void> {
    await this.createQueryBuilder()
      .where('id IN(:...userIds)', { userIds })
      .delete()
      .execute();
  }

  /**
   * Retrieves a user entity based on the provided email confirmation token.
   *
   * @param {string} emailConfirmationToken - The token used to confirm the user's email address.
   * @return {Promise<UserEntity>} A promise that resolves to the UserEntity matching the token.
   */
  async getUserByEmailConfirmationToken(
    emailConfirmationToken: string,
  ): Promise<UserEntity> {
    return this.createQueryBuilder('users')
      .withDeleted()
      .leftJoinAndSelect('users.account', 'account')
      .where('users.emailConfirmationToken =:emailConfirmationToken', {
        emailConfirmationToken,
      })
      .getOne();
  }

  /**
   * Retrieves a user based on the provided password reset confirmation token.
   *
   * @param {string} passwordResetConfirmationToken - The token used to verify the user's password reset request.
   * @return {Promise<UserEntity>} A promise that resolves to the user entity if found, otherwise null.
   */
  async getUserByPasswordResetConfirmationToken(
    passwordResetConfirmationToken: string,
  ): Promise<UserEntity> {
    return this.createQueryBuilder('users')
      .withDeleted()
      .leftJoinAndSelect('users.account', 'personalAccount')
      .leftJoinAndSelect('personalAccount.timezone', 'timezone')
      .leftJoinAndSelect('users.status', 'status')
      .leftJoinAndSelect('users.accountUsers', 'accountUsers')
      .leftJoinAndSelect('accountUsers.role', 'role')
      .leftJoinAndSelect('accountUsers.account', 'account')
      .where(
        'users.passwordResetConfirmationToken =:passwordResetConfirmationToken',
        { passwordResetConfirmationToken },
      )
      .getOne();
  }

  /**
   * Retrieves a user entity with the specified user ID. The query includes
   * associations for the user's account, personal account's timezone, status,
   * account users, their roles, and accounts.
   *
   * @param {IdType} userId - The ID of the user to retrieve.
   * @return {Promise<UserEntity>} A promise that resolves to the user entity.
   */
  async getUser(userId: IdType): Promise<UserEntity> {
    return this.createQueryBuilder('users')
      .withDeleted()
      .leftJoinAndSelect('users.account', 'personalAccount')
      .leftJoinAndSelect('personalAccount.timezone', 'timezone')
      .leftJoinAndSelect('users.status', 'status')
      .leftJoinAndSelect('users.accountUsers', 'accountUsers')
      .leftJoinAndSelect('accountUsers.role', 'role')
      .leftJoinAndSelect('accountUsers.account', 'account')
      .where('users.id = :userId', { userId })
      .getOne();
  }

  /**
   * Retrieves a user by their Google ID from the database.
   *
   * @param {number} googleId - The Google ID of the user to retrieve.
   * @return {Promise<UserEntity>} A promise that resolves to the user entity.
   */
  async getUserByGoogleId(googleId: number): Promise<UserEntity> {
    return this.createQueryBuilder('users')
      .withDeleted()
      .leftJoinAndSelect('users.account', 'personalAccount')
      .leftJoinAndSelect('personalAccount.timezone', 'timezone')
      .leftJoinAndSelect('users.status', 'status')
      .leftJoinAndSelect('users.accountUsers', 'accountUsers')
      .leftJoinAndSelect('accountUsers.role', 'role')
      .leftJoinAndSelect('accountUsers.account', 'account')
      .withDeleted()
      .where('users.googleId =:googleId', { googleId })
      .getOne();
  }

  /**
   * Retrieves a UserEntity by email, including related entities such as account, timezone, status, and roles.
   *
   * @param {string} email - The email address of the user to retrieve.
   * @return {Promise<UserEntity>} - A promise that resolves to the UserEntity object that matches the given email.
   */
  async getUserByEmail(email: string): Promise<UserEntity> {
    return this.createQueryBuilder('users')
      .withDeleted()
      .leftJoinAndSelect('users.account', 'personalAccount')
      .leftJoinAndSelect('personalAccount.timezone', 'timezone')
      .leftJoinAndSelect('users.status', 'status')
      .leftJoinAndSelect('users.accountUsers', 'accountUsers')
      .leftJoinAndSelect('accountUsers.role', 'role')
      .leftJoinAndSelect('accountUsers.account', 'account')
      .withDeleted()
      .where('users.email =:email', { email })
      .getOne();
  }
}
