import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { FolderEntity } from 'modules/folders/entities/folder.entity';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { EntityRepository, getManager } from 'typeorm';
import { IdType } from 'modules/common/types/id-type.type';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { RetrieveContentsOfFolderType } from 'modules/folders/types/retrieve-contents-of-folder.type';
import { RetrieveContentsInFolderRequest } from 'modules/folders/requests/retrieve-contents-in-folder.request';
import { ContentType } from 'modules/folders/types/content.type';
import { Pagination } from 'nestjs-typeorm-paginate';
import { MyFoldersType } from 'modules/folders/types/my-folders.type';
import { GetMyFoldersRequest } from 'modules/folders/requests/get-my-folders.request';
import { getKeyByValue } from 'modules/common/utils/get-enum-value-by-key';
import { SortMyFoldersEnum } from 'modules/folders/enums/sort-my-folders.enum';
import { SortRetrieveContentsInFolderEnum } from 'modules/folders/enums/sort-retrieve-contents-in-folder.enum';
import { UserPayload } from 'modules/common/types/user-payload.type';
import { SystemFolderNamesEnum } from 'modules/folders/enums/system-folder-names.enum';
import { DeviceTypesEnum } from 'modules/device-types/enums/device-types.enum';
import { GetMyFoldersType } from 'modules/folders/types/get-my-folders.type';

@Injectable()
@EntityRepository(FolderEntity)
export class FolderRepository extends BaseRepository<FolderEntity> {
  /**
   * Retrieves a specific account folder by its ID and the associated account ID.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {IdType} folderId - The unique identifier of the folder.
   * @return {Promise<FolderEntity>} A promise that resolves to the folder entity.
   */
  async getAccountFolder(
    accountId: IdType,
    folderId: IdType,
  ): Promise<FolderEntity> {
    return this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .where('folders.id =:folderId and folders.account_id =:accountId', {
        folderId,
        accountId,
      })
      .getOne();
  }
  /**
   * Deletes all assigned folders based on the provided folder IDs.
   *
   * @param {IdType[]} folderIds - An array of folder IDs to be deleted.
   * @return {Promise<void>} A promise that resolves when the folders are deleted.
   */
  async deleteAllAssignedFolders(folderIds: IdType[]): Promise<void> {
    await this.query(
      `delete from folders_invitations where folders_id in (${folderIds.map(
        (id) => id,
      )})`,
    );
    await this.query(
      `delete from users_folders where folders_id in (${folderIds.map(
        (id) => id,
      )})`,
    );
  }

  /**
   * Calculates the total number of keywords in all projects within the given folder and its subfolders.
   *
   * @param {IdType} folderId - The ID of the parent folder to start the search from.
   * @return {Promise<number>} - The total number of keywords found in all projects within the folder and its descendants.
   */
  async getNumberOfKeywordsInAllInternalFolders(
    folderId: IdType,
  ): Promise<number> {
    const folders = [];
    let totalKeywords = 0;
    const childrenFolders = await this.createQueryBuilder('folders')
      .where('folders.parent_id =:parentId', {
        parentId: folderId,
      })
      .getMany();
    for (const childrenFolder of childrenFolders) {
      const descendants = await getManager()
        .getTreeRepository(FolderEntity)
        .findDescendants(childrenFolder, {
          relations: ['projects', 'projects.keywords'],
        });

      folders.push(...descendants);

      for (const folder of descendants) {
        for (const project of folder.projects) {
          if (project.keywords) {
            totalKeywords += project.keywords.length;
          }
        }
      }
    }

    return totalKeywords;
  }

  /**
   * Retrieves a system folder based on the given account ID and folder name.
   *
   * @param {IdType} accountId - The unique identifier of the account.
   * @param {SystemFolderNamesEnum} name - The name of the system folder to retrieve.
   * @return {Promise<FolderEntity>} A promise that resolves to the FolderEntity matching the criteria or null if not found.
   */
  async getSystemFolder(
    accountId: IdType,
    name: SystemFolderNamesEnum,
  ): Promise<FolderEntity> {
    return this.createQueryBuilder('folders')
      .where('folders.account_id =:accountId and folders.name =:name', {
        accountId,
        name,
      })
      .getOne();
  }

  /**
   * Retrieves a tree of folders by their IDs and account ID.
   *
   * @param {IdType[]} folderIds - The array of folder IDs to retrieve.
   * @param {IdType} accountId - The account ID to which the folders belong.
   * @return {Promise<FolderEntity[]>} - A promise that resolves to an array of folder entities including their nested descendants.
   * @throws {ForbiddenException} - If access to the current folders is denied.
   */
  async folderTreeByIds(
    folderIds: IdType[],
    accountId: IdType,
  ): Promise<FolderEntity[]> {
    const currentFolders = await this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.projects', 'projects')
      .leftJoinAndSelect('folders.users', 'users')
      .where(
        'folders.id IN (:...folderIds) and folders.account_id =:accountId',
        {
          folderIds,
          accountId,
        },
      )
      .getMany();
    if (!currentFolders?.length) {
      throw new ForbiddenException('Access to the current folders is denied');
    }
    const folders = [];
    for (const currentFolder of currentFolders) {
      folders.push(currentFolder);
      const childrenFolders = await this.createQueryBuilder('folders')
        .leftJoinAndSelect('folders.users', 'users')
        .where(
          'folders.parent_id =:parentId and folders.account_id =:accountId',
          {
            parentId: currentFolder.id,
            accountId,
          },
        )
        .getMany();

      for (const childrenFolder of childrenFolders) {
        folders.push(
          ...(await getManager()
            .getTreeRepository(FolderEntity)
            .findDescendants(childrenFolder, {
              relations: ['projects', 'users'],
            })),
        );
      }
    }
    return folders;
  }

  /**
   * Retrieves all internal project folders based on the provided folder IDs.
   *
   * @param {IdType} accountId - The ID of the account to which the folders belong.
   * @param {IdType[]} folderIds - An array of folder IDs to retrieve the internal project folders.
   * @param {IdType} userId - The ID of the user making the request.
   * @return {Promise<FolderEntity[]>} A promise that resolves to an array of FolderEntity objects.
   * @throws {ForbiddenException} Throws an exception if access to the folders is denied.
   */
  async getAllInternalProjectFoldersByFolderIds(
    accountId: IdType,
    folderIds: IdType[],
    userId: IdType,
  ): Promise<FolderEntity[]> {
    const currentFolders = await this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .leftJoinAndSelect('folders.projects', 'projects')
      .where(
        'folders.id IN (:...folderIds) and folders.account_id =:accountId and users.id =:userId',
        {
          folderIds,
          accountId,
          userId,
        },
      )
      .getMany();
    if (!currentFolders?.length) {
      throw new ForbiddenException('Access to the current folders is denied');
    }
    const folders = [];
    for (const currentFolder of currentFolders) {
      folders.push(currentFolder);
      const childrenFolders = await this.createQueryBuilder('folders')
        .where(
          'folders.parent_id =:parentId and folders.account_id =:accountId',
          {
            parentId: currentFolder.id,
            accountId,
          },
        )
        .getMany();

      for (const childrenFolder of childrenFolders) {
        folders.push(
          ...(await getManager()
            .getTreeRepository(FolderEntity)
            .findDescendants(childrenFolder, {
              relations: ['projects'],
            })),
        );
      }
    }
    return folders;
  }

  /**
   * Retrieves all folders and their internal folders based on the provided parameters.
   *
   * @param {IdType} accountId - The ID of the account to which the folders belong.
   * @param {IdType} folderId - The ID of the parent folder.
   * @param {UserPayload} user - The user payload containing user information.
   * @param {IdType[]} folderIds - An array of folder IDs to filter the children folders.
   * @return {Promise<FolderEntity[]>} A promise that resolves to an array of FolderEntity objects.
   * @throws {ForbiddenException} Throws if access to the current folder is denied.
   */
  async getFoldersWithAllInternalFolders(
    accountId: IdType,
    folderId: IdType,
    user: UserPayload,
    folderIds: IdType[],
  ): Promise<FolderEntity[]> {
    const currentFolder = await this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .where(
        'folders.id =:folderId and folders.account_id =:accountId and users.id =:userId',
        {
          folderId,
          accountId,
          userId: user.id,
        },
      )
      .getOne();
    if (!currentFolder) {
      throw new ForbiddenException('Access to the current folder is denied');
    }

    const childrenFolders = await this.createQueryBuilder('folders')
      .where('folders.parent_id =:parentId and folders.id IN(:...folderIds)', {
        parentId: currentFolder.id,
        folderIds,
      })
      .getMany();
    const folders = [];
    for (const childrenFolder of childrenFolders) {
      folders.push(
        ...(await getManager()
          .getTreeRepository(FolderEntity)
          .findDescendants(childrenFolder, {
            relations: [
              'projects',
              'projects.competitors',
              'projects.notes',
              'projects.keywords',
              'projects.users',
            ],
          })),
      );
    }

    const newFolders = [];
    for (const folder of folders) {
      if (folder.id == folderId) {
        continue;
      }
      newFolders.push(folder);
    }
    return newFolders;
  }

  /**
   * Retrieves an available folder for a specified account, folder, and user.
   *
   * @param {IdType} accountId - The ID of the account.
   * @param {IdType} folderId - The ID of the folder.
   * @param {IdType} userId - The ID of the user.
   * @return {Promise<FolderEntity>} A promise that resolves to the folder entity if found, otherwise null.
   */
  async getAnAvailableFolder(
    accountId: IdType,
    folderId: IdType,
    userId: IdType,
  ): Promise<FolderEntity> {
    return this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .leftJoinAndSelect('folders.parent', 'parent')
      .where(
        'folders.account_id =:accountId and folders.id =:folderId and users.id =:userId',
        {
          accountId,
          folderId,
          userId,
        },
      )
      .getOne();
  }

  /**
   * Retrieves a paginated list of folders for the authenticated user based on the supplied filter criteria.
   *
   * @param {MyFoldersType} payload - The payload containing the user and account information.
   * @param {GetMyFoldersRequest} options - The request options including pagination, search, filter by tags, and sort information.
   * @return {Promise<Pagination<GetMyFoldersType>>} A promise that resolves to a paginated result containing the folders.
   * @throws {BadRequestException} Throws an exception if the master folder is not found.
   */
  async getMyFolders(
    payload: MyFoldersType,
    options: GetMyFoldersRequest,
  ): Promise<Pagination<GetMyFoldersType>> {
    const masterFolder = await this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .where('folders.account_id =:accountId and users.id =:userId', {
        accountId: payload.accountId,
        userId: payload.user.id,
      })
      .orderBy('folders.id', 'ASC')
      .getOne();
    if (!masterFolder) {
      throw new BadRequestException('Master Folder not found.');
    }
    const result = await this.query(
      `
select folders.* from folders
left join users on folders.owner_id = users.id
left join projects_folders on folders.id = projects_folders.folders_id
left join projects on projects_folders.projects_id = projects.id
${
  options.tagIds && options.tagIds.length > 0
    ? 'left join projects_tags_projects_tags on projects.id = projects_tags_projects_tags.projects_id'
    : ''
}
left join keywords on projects.id = keywords.project_id
where parent_id = $1 ${options.search ? 'and keywords.name ILIKE $2' : ''}
${
  options.tagIds && options.tagIds.length > 0
    ? `and projects_tags_projects_tags.projects_tags_id in (${options.tagIds.map(
        (tagId) => tagId,
      )})`
    : ''
}
group by folders.id
    `,
      options.search
        ? [masterFolder.id, `%${options.search}%`]
        : [masterFolder.id],
    );
    const count = result.length ?? 0;
    const itemsPerPage = Number(options.limit);
    const currentPage = Number(options.page);
    const items = await this.query(
      `
select folders.*,
users.id as owner_id, 
users.username as owner_name,
COUNT(keywords.id)::FLOAT as keyword_count
from folders
left join users on folders.owner_id = users.id
left join projects_folders on folders.id = projects_folders.folders_id
left join projects on projects_folders.projects_id = projects.id
${
  options.tagIds && options.tagIds.length > 0
    ? 'left join projects_tags_projects_tags on projects.id = projects_tags_projects_tags.projects_id'
    : ''
}
left join keywords on projects.id = keywords.project_id
where parent_id = $1 ${options.search ? 'and keywords.name ILIKE $4' : ''}
${
  options.tagIds && options.tagIds.length > 0
    ? `and projects_tags_projects_tags.projects_tags_id in (${options.tagIds.map(
        (tagId) => tagId,
      )})`
    : ''
}
group by 
    folders.id,
    users.id
order by ${
        options.sortBy
          ? `${getKeyByValue(SortMyFoldersEnum, options.sortBy)} ${
              options.sortOrder
            }`
          : `folders.name ${options.sortOrder}`
      }
OFFSET $2 LIMIT $3
    `,
      options.search
        ? [
            masterFolder.id,
            (currentPage - 1) * itemsPerPage,
            itemsPerPage,
            `%${options.search}%`,
          ]
        : [masterFolder.id, (currentPage - 1) * itemsPerPage, itemsPerPage],
    );
    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems: count,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
        currentPage,
      },
    };
  }

  /**
   * Retrieves the contents of a specified folder, including both projects and subfolders,
   * and applies filters, sorting, and pagination based on the provided options.
   *
   * @param {RetrieveContentsOfFolderType} payload - Object containing the folder ID and account information.
   * @param {RetrieveContentsInFolderRequest} options - Options for filtering, sorting, and pagination.
   * @return {Promise<Pagination<ContentType>>} - Returns a Promise that resolves to a paginated result containing the folder contents.
   */
  async getContents(
    payload: RetrieveContentsOfFolderType,
    options: RetrieveContentsInFolderRequest,
  ): Promise<Pagination<ContentType>> {
    const itemsPerPage = Number(options.limit);
    const currentPage = Number(options.page);
    const result = await this.query(
      `
    select COUNT(*) from (
        select 
            projects.id as id,
            projects.project_name as name,
            1 as type,
            projects.url as url,
            "check-frequency".id as frequency_id,
            "check-frequency".name as frequency_name,
            0 as keywords_status,
            projects.updated_at as updated_at,
            projects.created_at as created_at
        from projects
        left join projects_tags_projects_tags on projects_tags_projects_tags.projects_id = projects.id
        left join keywords on keywords.project_id = projects.id
        left join users_projects on projects.id = users_projects.projects_id
        left join projects_folders on projects.id = projects_folders.projects_id
        left join "check-frequency" on projects.check_frequency_id = "check-frequency".id
            where projects_folders.folders_id = $1 
                and projects.account_id = $2 
                and users_projects.users_id = $3
                ${options.search ? ' and keywords.name ILike($4)' : ''}
                ${
                  options.tagIds?.length > 0
                    ? ` and projects_tags_projects_tags.projects_tags_id In(${options.tagIds
                        .join(',')
                        .trim()})`
                    : ``
                }
        union
        select 
            folders.id as id,
            folders.name as name,
            2 as type, 
            '-' as url,
            0 as frequency_id,
            '-' as frequency_name,
            0 as keywords_status,
            folders.updated_at as updated_at,
            folders.created_at as created_at
        from folders 
        left join users_folders on folders.id = users_folders.folders_id
        left join projects_folders on projects_folders.folders_id = folders.id
        left join projects on projects.id = projects_folders.projects_id
        left join keywords on projects.id = keywords.project_id
            where folders.account_id =$2 and users_folders.users_id = $3 
            and folders.parent_id = $1
            ${options.search ? ' and keywords.name ILike($4)' : ''}
            ) as result
    `,
      options.search
        ? [
            payload.folderId,
            payload.accountId,
            payload.user.id,
            `%${options.search}%`,
          ]
        : [payload.folderId, payload.accountId, payload.user.id],
    );
    const items = await this.query(
      `
select *, 
CASE
    WHEN result.desktop_type_count > 0 AND result.mobile_type_count > 0 THEN '${
      DeviceTypesEnum.DesktopAndMobile
    }'
    ELSE CASE
          WHEN result.desktop_type_count > 0 AND result.mobile_type_count = 0 THEN '${
            DeviceTypesEnum.Desktop
          }'
    ELSE '${DeviceTypesEnum.Mobile}'
            END
    END AS project_device_type
from (
        select 
            projects.id as id,
            projects.project_name as name,
            projects.created_at as created_at,
            1 as type,
            projects.url as url,
            "check-frequency".id as frequency_id,
            "check-frequency".name as frequency_name,
            0 as keywords_status,
            projects.updated_at as updated_at,
            null as last_modified,
            COALESCE(COUNT(keywords.id), 0)::FLOAT AS keywords_count,
            '-' as created_by,
            latest_project_overview.no_change,
            latest_project_overview.improved,
            latest_project_overview.declined,
            latest_project_overview.update_date::text,
            latest_project_overview.previous_update_date::text,
            COALESCE(SUM(CASE WHEN desktop_types.name = '${
              DeviceTypesEnum.Desktop
            }' THEN 1 ELSE 0 END), 0)::FLOAT AS desktop_type_count,
            COALESCE(SUM(CASE WHEN desktop_types.name = '${
              DeviceTypesEnum.Mobile
            }' THEN 1 ELSE 0 END), 0)::FLOAT AS mobile_type_count,
            COALESCE(SUM(CASE WHEN keywords.position_update is true THEN 1 ELSE 0 END ), 0)::FLOAT as number_of_keywords_that_are_updated,
            search_engines.id as search_engines_id,
            search_engines.name as search_engines_name,
            google_domains.id as google_domains_id,
            google_domains.name as google_domains_name,
            google_domains.country_name as google_domains_country_name
        from projects
        left join search_engines on projects.search_engine_id = search_engines.id
        left join google_domains on projects.region_id = google_domains.id
        left join projects_tags_projects_tags on projects_tags_projects_tags.projects_id = projects.id
            left join users_projects on projects.id = users_projects.projects_id
            left join keywords on projects.id = keywords.project_id
            left join desktop_types on keywords.device_type_id = desktop_types.id
            left join projects_folders on projects.id = projects_folders.projects_id
            left join "check-frequency" on projects.check_frequency_id = "check-frequency".id
            LEFT JOIN latest_project_overview on projects.id = latest_project_overview.project_id
            where projects_folders.folders_id = $1 
                and projects.account_id = $2 
                    and users_projects.users_id = $3
                    and keywords.name ILIKE $6
                    ${
                      options.tagIds?.length > 0
                        ? ` and projects_tags_projects_tags.projects_tags_id IN(${options.tagIds
                            .join(',')
                            .trim()})`
                        : ''
                    }
            GROUP BY 
            projects.id, 
            "check-frequency".id,
            latest_project_overview.id,
            search_engines.id,
            google_domains.id
        union
        select 
            folders.id as id,
            folders.name as name,
            folders.created_at as created_at,
            2 as type, 
            '-' as url,
            0 as frequency_id,
            '-' as frequency_name,
            0 as keywords_status,
            folders.updated_at as updated_at,
            folders.updated_at as last_modified,
            COUNT(keywords.id)::FLOAT as keywords_count,
            users.username as created_by,
            0 as improved,
       0 as declined,
       0 as no_change,
       '-' as update_date,
       '-' as previous_update_date,
       0 as desktop_type_count,
       0 as mobile_type_count,
       0 as number_of_keywords_that_are_updated,
       0 as search_engines_id,
       '-' as search_engines_name,
        0 as google_domains_id,
       '-' as google_domains_name,
       '-' as google_domains_country_name
        from folders 
        left join users on users.id = folders.owner_id
        left join users_folders on folders.id = users_folders.folders_id
        left join projects_folders on projects_folders.folders_id = folders.id
        left join projects on projects.id = projects_folders.projects_id
        left join keywords on projects.id = keywords.project_id
            where folders.account_id = $2 
            and users_folders.users_id = $3 
            and folders.parent_id = $1
            ${
              options.search ? ' and keywords.name ILike($6)' : ''
            } group by folders.id, users.id
            ) as result 
            ${
              options.sortBy
                ? `ORDER BY ${getKeyByValue(
                    SortRetrieveContentsInFolderEnum,
                    options.sortBy,
                  )} ${options.sortOrder}`
                : 'ORDER BY type DESC'
            }
            OFFSET $4 LIMIT $5`,

      [
        payload.folderId,
        payload.accountId,
        payload.user.id,
        (currentPage - 1) * itemsPerPage,
        itemsPerPage,
        options.search ? `%${options.search}%` : '%%',
      ],
    );
    const count = result[0].count ?? 0;
    return {
      items,
      meta: {
        itemCount: items.length,
        totalItems: count,
        itemsPerPage,
        totalPages: Math.ceil(count / itemsPerPage),
        currentPage,
      },
    };
  }

  /**
   * Fetches an array of folder entities based on the provided array of folder IDs.
   *
   * @param {IdType[]} ids - An array containing the IDs of the folders to be fetched.
   * @return {Promise<FolderEntity[]>} A promise that resolves to an array of folder entities, including related projects and users.
   */
  async getFoldersByIds(ids: IdType[]): Promise<FolderEntity[]> {
    return this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.projects', 'projects')
      .leftJoinAndSelect('folders.users', 'users')
      .where('folders.id IN(:...ids)', { ids })
      .getMany();
  }
  /**
   * Retrieves a list of available folders for a given user and account.
   *
   * @param {IdType} userId - The ID of the user for whom the folders are being retrieved.
   * @param {IdType} accountId - The ID of the account under which the folders are registered.
   * @param {string} [search] - An optional search string to filter the folders by name.
   *
   * @return {Promise<FolderEntity[]>} A promise that resolves to an array of FolderEntity objects representing the available folders.
   */
  async getListAvailableFolders(
    userId: IdType,
    accountId: IdType,
    search?: string,
  ): Promise<FolderEntity[]> {
    const searchQuery = search ? ` and folders.name ILike(:search)` : '';
    return this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .where(
        `users.id = :userId and folders.account_id =:accountId and folders.name NOT IN(:...systemNames) ${searchQuery}`,
        {
          userId,
          accountId,
          systemNames: [
            SystemFolderNamesEnum.MyFolders,
            SystemFolderNamesEnum.UncategorizedProjects,
          ],
          search: `%${search}%`,
        },
      )
      .orderBy('folders.name', 'ASC')
      .getMany();
  }

  /**
   * Removes the specified projects from a given folder.
   *
   * @param {FolderEntity} folder - The folder entity from which the projects will be removed.
   * @param {ProjectEntity[]} projects - An array of project entities to be removed from the folder.
   * @return {Promise<void>} A promise that resolves when the projects have been successfully removed from the folder.
   */
  async removeProjectsFromFolder(
    folder: FolderEntity,
    projects: ProjectEntity[],
  ) {
    await this.query(
      `DELETE FROM projects_folders where folders_id =$1 and projects_id in (${projects.map(
        (item) => item.id,
      )})`,
      [folder.id],
    );
  }

  /**
   * Retrieves the folder tree available to a user, including associated projects and user information.
   *
   * @param {IdType} userId - The ID of the user whose accessible folder tree is to be retrieved.
   * @return {Promise<FolderEntity>} - A promise that resolves to the folder entity representing the root of the tree.
   * @throws {BadRequestException} - If the master folder is not found.
   */
  async accessAvailableFolderTree(userId: IdType): Promise<FolderEntity> {
    const masterFolder = await this.createQueryBuilder('folders')
      .leftJoinAndSelect('folders.users', 'users')
      .leftJoinAndSelect('folders.projects', 'projects')
      .where('users.id =:userId', { userId })
      .orderBy('folders.id', 'ASC')
      .getOne();
    if (!masterFolder) {
      throw new BadRequestException('Master Folder not found.');
    }
    return getManager()
      .getTreeRepository(FolderEntity)
      .findDescendantsTree(masterFolder, {
        relations: ['projects', 'owner', 'users'],
      });
  }

  /**
   * Retrieves the hierarchical tree structure of folders for a given account.
   *
   * @param {IdType} accountId - The ID of the account to retrieve the tree structure for.
   * @return {Promise<FolderEntity>} - A promise that resolves to the root folder entity with its descendants.
   */
  async getTree(accountId: IdType): Promise<FolderEntity> {
    const masterFolder = await this.createQueryBuilder('folders')
      .where('folders.account_id =:accountId', {
        accountId,
      })
      .leftJoinAndSelect('folders.projects', 'projects')
      .leftJoinAndSelect('projects.users', 'projectUsers')
      .leftJoinAndSelect('folders.users', 'foldersUsers')
      .orderBy('folders.id', 'ASC')
      .getOne();
    if (!masterFolder) {
      throw new BadRequestException('Master Folder not found.');
    }
    return getManager()
      .getTreeRepository(FolderEntity)
      .findDescendantsTree(masterFolder, {
        relations: ['projects', 'users', 'projects.users'],
      });
  }
}
