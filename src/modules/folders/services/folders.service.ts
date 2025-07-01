import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FolderRepository } from 'modules/folders/repositories/folder.repository';
import { IdType } from 'modules/common/types/id-type.type';
import { FolderEntity } from 'modules/folders/entities/folder.entity';
import { FoldersResponseFactory } from 'modules/folders/factories/folders-response.factory';
import { CreatingMasterAccountFolderType } from 'modules/folders/types/creating-master-account-folder.type';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { ListAvailableFoldersResponse } from 'modules/folders/responses/list-available-folders.response';
import { FolderResponse } from 'modules/folders/responses/folder.response';
import { UserEntity } from 'modules/users/entities/user.entity';
import { RetrieveContentsOfFolderType } from 'modules/folders/types/retrieve-contents-of-folder.type';
import { RetrieveContentsInFolderRequest } from 'modules/folders/requests/retrieve-contents-in-folder.request';
import { FolderContentsResponseFactory } from 'modules/folders/factories/folder-contents-response.factory';
import { FolderContentsResponse } from 'modules/folders/responses/folder-contents.response';
import { MyFoldersType } from 'modules/folders/types/my-folders.type';
import { GetMyFoldersRequest } from 'modules/folders/requests/get-my-folders.request';
import { MyFoldersResponse } from 'modules/folders/responses/my-folders.response';
import { MyFolderResponse } from 'modules/folders/responses/my-folder.response';
import { RenameFolderType } from 'modules/folders/types/rename-folder.type';
import { MoveFoldersType } from 'modules/folders/types/move-folders.type';
import { dateHelper } from 'modules/common/utils/dateHelper';
import { DeletionOfFolderContentsType } from 'modules/folders/types/deletion-of-folder-contents.type';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';
import { formatGoogleStyleDate } from 'modules/common/utils/formatGoogleStyleDate';
import { EventBus } from '@nestjs/cqrs';
import { DeleteFoldersEvent } from 'modules/folders/events/delete-folders.event';
import { DeleteProjectsEvent } from 'modules/projects/events/delete-projects.event';
import { MyFoldersResponseFactory } from 'modules/folders/factories/my-folders-response.factory';
import { RefreshFolderTreeEvent } from 'modules/accounts/events/refresh-folder-tree.event';
import { AssigningAChildFolderToParentFolderManagerEvent } from 'modules/invitations/events/assigning-a-child-folder-to-parent-folder-manager.event';

@Injectable()
export class FoldersService {
  constructor(
    private readonly folderRepository: FolderRepository,
    private readonly foldersResponseFactory: FoldersResponseFactory,
    private readonly folderContentsResponseFactory: FolderContentsResponseFactory,
    private readonly eventBus: EventBus,
    private readonly myFoldersResponseFactory: MyFoldersResponseFactory,
  ) {}

  /**
   * Retrieves the system folder for the given account by its system name.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {SystemFolderNamesEnum} name - The system name of the folder.
   *
   * @return {Promise<FolderEntity>} The system folder entity.
   * @throws {BadRequestException} If the folder is not found.
   */
  async getAccountFolderBySystemName(
    accountId: IdType,
    name: SystemFolderNamesEnum,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.getSystemFolder(accountId, name);
    if (!folder) {
      throw new BadRequestException('Folder not found');
    }
    return folder;
  }

  /**
   * Fetches all internal project folders by given folder IDs for a specified account and user.
   *
   * @param {IdType} accountId - The account identifier.
   * @param {IdType[]} folderIds - An array of folder identifiers.
   * @param {IdType} userId - The user identifier.
   * @return {Promise<FolderEntity[]>} A promise that resolves to an array of FolderEntity objects.
   */
  async getAllInternalProjectFoldersByFolderIds(
    accountId: IdType,
    folderIds: IdType[],
    userId: IdType,
  ): Promise<FolderEntity[]> {
    return this.folderRepository.getAllInternalProjectFoldersByFolderIds(
      accountId,
      folderIds,
      userId,
    );
  }

  /**
   * Deletes the contents of specified folders and their associated projects for a given account.
   *
   * @param {DeletionOfFolderContentsType} payload - The input data required for deleting folder contents.
   * Contains accountId, folderId, user, folderIds, and projectIds.
   *
   * @return {Promise<void>} A promise that resolves once the deletion process is complete.
   */
  @Transactional()
  async deletionOfFolderContents(payload: DeletionOfFolderContentsType) {
    if (payload.projectIds?.length) {
      this.eventBus.publish(
        new DeleteProjectsEvent({
          accountId: payload.accountId,
          projectIds: payload.projectIds,
        }),
      );
    }
    if (payload.folderIds?.length) {
      const folders =
        await this.folderRepository.getFoldersWithAllInternalFolders(
          payload.accountId,
          payload.folderId,
          payload.user,
          payload.folderIds,
        );
      await this.defineMainAccountFolder(folders);
      const deletionFolderIds = [];
      const deletionProjectIds = [];
      for (const folder of folders) {
        deletionFolderIds.push(folder.id);
        if (folder.projects.length > 0) {
          deletionProjectIds.push(
            ...folder.projects.map((project) => project.id),
          );
        }
      }
      if (deletionProjectIds.length) {
        this.eventBus.publish(
          new DeleteProjectsEvent({
            accountId: payload.accountId,
            projectIds: deletionProjectIds,
          }),
        );
      }
      if (deletionFolderIds.length) {
        this.eventBus.publish(
          new DeleteFoldersEvent({ folderIds: deletionFolderIds }),
        );
      }
    }
    this.eventBus.publish(
      new RefreshFolderTreeEvent({ accountId: payload.accountId }),
    );
  }

  /**
   * Checks the availability of a folder within the given folders array based on the folder ID.
   *
   * @param {FolderEntity[]} folders - An array of folders to search within.
   * @param {IdType} folderId - The ID of the folder to check for availability.
   * @return {Promise<boolean>} A promise that resolves to true if the folder is found, otherwise false.
   */
  async checkAvailabilityOfFolder(
    folders: FolderEntity[],
    folderId: IdType,
  ): Promise<boolean> {
    return !!folders.find((folder) => folder.id === folderId);
  }

  /**
   * Updates the main account folder from the provided list of folders.
   *
   * @param {FolderEntity[]} folders - The list of folder entities to process.
   * @return {Promise<void>} A promise that resolves when the main account folder has been defined.
   * @throws {BadRequestException} If any of the provided folders are system folders.
   */
  async defineMainAccountFolder(folders: FolderEntity[]): Promise<void> {
    if (
      folders.find(
        (folder) =>
          folder.name === SystemFolderNamesEnum.MyFolders ||
          folder.name === SystemFolderNamesEnum.UncategorizedProjects,
      )
    ) {
      throw new BadRequestException('System folders may not be modified');
    }
  }

  /**
   * Renames a folder if it meets the required conditions.
   *
   * @param {RenameFolderType} payload - The details required for renaming the folder, including accountId, folderId, user, and newName.
   * @return {Promise<void>} - A promise that resolves when the folder has been successfully renamed.
   * @throws {NotFoundException} - If the folder does not exist or is not available.
   * @throws {BadRequestException} - If the new name is not allowed or a folder with the new name already exists in the parent folder.
   */
  async renameFolder(payload: RenameFolderType): Promise<void> {
    const folder = await this.folderRepository.getAnAvailableFolder(
      payload.accountId,
      payload.folderId,
      payload.user.id,
    );
    if (!folder) {
      throw new NotFoundException('Folder does not exist or is not available');
    }
    await this.defineMainAccountFolder([folder]);
    if (
      payload.newName === SystemFolderNamesEnum.MyFolders ||
      payload.newName === SystemFolderNamesEnum.UncategorizedProjects
    ) {
      throw new BadRequestException(
        'It is forbidden to name a folder with the system name.',
      );
    }
    const parentFolder = await this.getFolder(folder.parent.id);

    const result = parentFolder.children.find(
      (item) => item.name === payload.newName,
    );
    if (result && result.id != payload.folderId) {
      throw new BadRequestException(
        'A folder with this name already exists in this folder.',
      );
    }
    await this.folderRepository.save({ id: folder.id, name: payload.newName });

    this.eventBus.publish(
      new AssigningAChildFolderToParentFolderManagerEvent({
        folderId: parentFolder.id,
        accountId: payload.accountId,
      }),
    );

    this.eventBus.publish(
      new RefreshFolderTreeEvent({ accountId: payload.accountId }),
    );
  }

  /**
   * Retrieves the folders belonging to the user specified in the payload.
   *
   * @param {MyFoldersType} payload - Contains user information and other data.
   * @param {GetMyFoldersRequest} option - Additional options and parameters for the request.
   * @return {Promise<MyFoldersResponse>} A promise that resolves to a response containing the user's folders and metadata.
   */
  async getMyFolders(
    payload: MyFoldersType,
    option: GetMyFoldersRequest,
  ): Promise<MyFoldersResponse> {
    const { items, meta } = await this.folderRepository.getMyFolders(
      payload,
      option,
    );
    return this.myFoldersResponseFactory.createResponse(items, {
      meta,
      userId: payload.user.id,
    });
  }

  /**
   * Checks if a folder is available to the user within the specified account.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} userId - The ID of the user.
   * @param {IdType} folderId - The ID of the folder.
   * @returns {Promise<void>} - Resolves if the folder is available to the user, otherwise throws an exception.
   * @throws {NotFoundException} If the folder is not found.
   * @throws {ForbiddenException} If the user does not have access to the folder.
   */
  private async checkIfFolderIsAvailableToUser(
    accountId: IdType,
    userId: IdType,
    folderId: IdType,
  ): Promise<void> {
    const folder = await this.folderRepository.getAccountFolder(
      accountId,
      folderId,
    );
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    const userIds = folder.users.map((user) => user.id);
    if (!userIds.includes(userId)) {
      throw new ForbiddenException('Access denied.');
    }
  }

  /**
   * Retrieves the contents of a specified folder for a given user.
   *
   * @param {RetrieveContentsOfFolderType} payload - The payload containing the accountId, userId, and folderId.
   * @param {RetrieveContentsInFolderRequest} options - The request options including filters and pagination settings.
   * @return {Promise<FolderContentsResponse>} A promise that resolves to the contents of the folder.
   */
  async retrieveContentsOfFolder(
    payload: RetrieveContentsOfFolderType,
    options: RetrieveContentsInFolderRequest,
  ): Promise<FolderContentsResponse> {
    await this.checkIfFolderIsAvailableToUser(
      payload.accountId,
      payload.user.id,
      payload.folderId,
    );
    const { items, meta } = await this.folderRepository.getContents(
      payload,
      options,
    );

    return this.folderContentsResponseFactory.createResponse(items, meta);
  }

  /**
   * Retrieves folders along with their child folders and projects based on the provided folder IDs.
   *
   * @param {IdType[]} folderIds - An array of folder IDs to find corresponding folders and their projects.
   * @param {IdType} accountId - The account ID for authentication and folder identification.
   *
   * @return {Promise<{ folders: FolderEntity[]; projects: ProjectEntity[] }>} A promise that resolves to an object containing arrays of folders and projects.
   */
  async getFoldersWithChildFoldersAndProjects(
    folderIds: IdType[],
    accountId: IdType,
  ): Promise<{ folders: FolderEntity[]; projects: ProjectEntity[] }> {
    if (folderIds?.length === 0) {
      return { folders: [], projects: [] };
    }
    const folders = await this.folderRepository.folderTreeByIds(
      folderIds,
      accountId,
    );
    const projects = [];
    for (const folder of folders) {
      if (folder.projects?.length > 0) {
        projects.push(...folder.projects);
      }
    }
    return { folders, projects };
  }

  /**
   * Retrieves a list of folders available to the user for a given account.
   *
   * @param {UserPayload} user - The user requesting the list of folders.
   * @param {IdType} accountId - The ID of the account for which the folders are being requested.
   * @param {string} [search] - An optional search query to filter the folders by name.
   * @return {Promise<ListAvailableFoldersResponse>} A promise that resolves to a response containing the list of available folders.
   */
  async getListAvailableFolders(
    user: UserPayload,
    accountId: IdType,
    search?: string,
  ): Promise<ListAvailableFoldersResponse> {
    const folders = await this.folderRepository.getListAvailableFolders(
      user.id,
      accountId,
      search,
    );
    return new ListAvailableFoldersResponse({ items: folders });
  }

  /**
   * Removes the specified projects from the given folder.
   *
   * @param {FolderEntity} folder - The folder from which the projects will be removed.
   * @param {ProjectEntity[]} projects - The projects to be removed from the folder.
   * @return {Promise<void>} - A promise that resolves when the projects have been removed.
   */
  async removeProjectsFromFolder(
    folder: FolderEntity,
    projects: ProjectEntity[],
  ): Promise<void> {
    await this.folderRepository.removeProjectsFromFolder(folder, projects);
  }

  /**
   * Adds a project to a specified folder and saves the updated folder.
   *
   * @param {ProjectEntity} project - The project entity to be added.
   * @param {FolderEntity} folder - The folder entity where the project will be added.
   * @return {Promise<void>} A promise that resolves when the folder is successfully saved.
   */
  async addProjectToFolder(project: ProjectEntity, folder: FolderEntity) {
    const projects = folder.projects;
    projects.push(project);
    await this.folderRepository.save({ ...folder, projects });
  }

  /**
   * Creates the master account folder structure for the given account and user.
   *
   * @param {CreatingMasterAccountFolderType} payload - The payload containing account and user information.
   * @return {Promise<void>} A promise that resolves once the master account folder structure has been created.
   */
  async creatingMasterAccountFolder(
    payload: CreatingMasterAccountFolderType,
  ): Promise<void> {
    const rootFolder = await this.getFolder(1);

    const folder = await this.folderRepository.save({
      name: SystemFolderNamesEnum.MyFolders,
      account: payload.account,
      owner: payload.user,
      parent: rootFolder,
      users: [payload.user],
    });
    await this.folderRepository.save({
      name: SystemFolderNamesEnum.UncategorizedProjects,
      parent: folder,
      owner: payload.user,
      users: [{ id: payload.user.id }],
      account: payload.account,
    });
  }

  /**
   * Fetches the available folder tree for the specified user.
   *
   * @param {IdType} userId - The unique identifier of the user.
   * @return {Promise<FolderResponse>} A promise that resolves to the folder tree response object.
   */
  async accessAvailableFolderTree(userId: IdType): Promise<FolderResponse> {
    const folderTree = await this.folderRepository.accessAvailableFolderTree(
      userId,
    );
    return this.foldersResponseFactory.createResponse(folderTree, { userId });
  }

  /**
   * Retrieves the folder tree structure for a given account.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {IdType} userId - The unique identifier of the user.
   * @return {Promise<FolderResponse>} A promise that resolves to the folder tree structure response.
   */
  async getFoldersTree(
    accountId: IdType,
    userId: IdType,
  ): Promise<FolderResponse> {
    const folderTree = await this.folderRepository.getTree(accountId);
    return this.foldersResponseFactory.createResponse(folderTree, { userId });
  }

  /**
   * Retrieves a folder entity by its ID, including its related projects and children.
   *
   * @param {IdType} folderId - The ID of the folder to retrieve.
   * @return {Promise<FolderEntity>} - A promise that resolves to the folder entity.
   * @throws {NotFoundException} - Throws an exception if the folder is not found.
   */
  async getFolder(folderId: IdType): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne(folderId, {
      relations: ['projects', 'children'],
    });
    if (!folder) {
      throw new NotFoundException('Folder not found.');
    }
    return folder;
  }
  /**
   * Moves a folder from one location to another within the same account and user context.
   *
   * @param {MoveFoldersType} payload - The payload containing details required to move the folder.
   *  The payload should include the following:
   *    accountId: The account ID.
   *    folderId: The ID of the folder to be moved.
   *    destinationFolderId: The ID of the destination folder where the folder will be moved.
   *    user: The user context which includes the user ID.
   * @return {Promise<void>} A promise that resolves when the folder has been successfully moved.
   * @throws {NotFoundException} If the folder or the destination folder does not exist or is not available.
   * @throws {BadRequestException} If a folder with the same name already exists in the destination folder.
   */
  async moveFolders(payload: MoveFoldersType): Promise<void> {
    const folder = await this.folderRepository.getAnAvailableFolder(
      payload.accountId,
      payload.folderId,
      payload.user.id,
    );
    if (!folder) {
      throw new NotFoundException('Folder does not exist or is not available.');
    }
    const parent = await this.getFolder(payload.destinationFolderId);
    if (!parent) {
      throw new NotFoundException(
        'Destination folder not found or not available.',
      );
    }
    const result = parent.children.find((item) => item.name === folder.name);
    if (result && result.id != folder.id) {
      throw new BadRequestException(
        'A folder with that name is already in this folder.',
      );
    }
    await this.folderRepository.save({
      ...folder,
      parent,
    });

    this.eventBus.publish(
      new AssigningAChildFolderToParentFolderManagerEvent({
        folderId: parent.id,
        accountId: payload.accountId,
      }),
    );

    this.eventBus.publish(
      new RefreshFolderTreeEvent({ accountId: payload.accountId }),
    );
  }

  /**
   * Creates a child folder under the specified parent folder with the provided name.
   *
   * @param {string} name - The name of the new child folder.
   * @param {IdType} parentId - The ID of the parent folder where the child folder will be created.
   * @param {UserPayload} user - The user payload containing information about the user creating the folder.
   * @param {IdType} accountId - The ID of the account associated with the folder.
   * @return {Promise<void>} A promise that resolves when the folder is successfully created.
   * @throws {BadRequestException} If the folder name is a system name or a folder with the same name already exists in the parent folder.
   */
  async createChildFolder(
    name: string,
    parentId: IdType,
    user: UserPayload,
    accountId: IdType,
  ): Promise<void> {
    const parent = await this.getFolder(parentId);
    if (
      name === SystemFolderNamesEnum.MyFolders ||
      name === SystemFolderNamesEnum.UncategorizedProjects
    ) {
      throw new BadRequestException(
        'It is forbidden to name a folder with the system name.',
      );
    }
    if (parent.children.find((item) => item.name === name)) {
      throw new BadRequestException(
        'A folder with this name already exists in this folder.',
      );
    }
    await this.folderRepository.save({
      name,
      parent,
      owner: { id: user.id },
      users: [{ id: user.id }],
      account: { id: accountId },
    });
    this.eventBus.publish(
      new AssigningAChildFolderToParentFolderManagerEvent({
        folderId: parentId,
        accountId,
      }),
    );
    this.eventBus.publish(new RefreshFolderTreeEvent({ accountId }));
  }

  /**
   * Adds a user to multiple folders by inserting the respective records into the 'users_folders' table.
   *
   * @param {UserEntity} user - The user entity to be added to the folders.
   * @param {FolderEntity[]} folders - An array of folder entities to which the user should be added.
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  async addUserToFolders(
    user: UserEntity,
    folders: FolderEntity[],
  ): Promise<void> {
    if (folders.length > 0) {
      const insertValues = folders.map((folder) => ({
        users_id: user.id,
        folders_id: folder.id,
      }));

      await this.folderRepository
        .createQueryBuilder()
        .insert()
        .into('users_folders')
        .values(insertValues)
        .orIgnore()
        .execute();
    }
  }
}
