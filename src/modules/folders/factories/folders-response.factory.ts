import { BaseResponseFactory } from 'modules/common/factories/base-response.factory';
import { FolderEntity } from 'modules/folders/entities/folder.entity';
import { FolderResponse } from 'modules/folders/responses/folder.response';
import { FolderProjectResponse } from 'modules/folders/responses/folder-project.response';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { UserEntity } from 'modules/users/entities/user.entity';
import { ProjectEntity } from 'modules/projects/entities/project.entity';
import { project } from 'gcp-metadata';

@Injectable()
export class FoldersResponseFactory extends BaseResponseFactory<
  FolderEntity,
  FolderResponse
> {
  /**
   * Creates a response object for the given folder entity and user options.
   *
   * @param {FolderEntity} entity - The folder entity to be processed.
   * @param {Object} options - Options object containing additional parameters.
   * @param {IdType} options.userId - The ID of the user.
   * @return {FolderResponse} The constructed response object containing folder details and project availability.
   */
  createResponse(
    entity: FolderEntity,
    options: { userId: IdType },
  ): FolderResponse {
    const newEntity = this.countHelper(entity, options.userId);
    return new FolderResponse({
      ...newEntity,
      projects:
        newEntity.projects?.length > 0
          ? newEntity.projects.map(
              (item: ProjectEntity) =>
                new FolderProjectResponse({
                  id: item.id,
                  available: !!item.users.find((i) => i.id == options.userId),
                }),
            )
          : [],
    });
  }

  /**
   * A helper function to count and process entities within a folder structure.
   *
   * @param {FolderEntity} entity - The folder entity to process.
   * @param {IdType} userId - The user ID to check for availability.
   * @return {any} The processed folder entity with updated internal count and availability.
   */
  countHelper(entity: FolderEntity, userId: IdType) {
    const newEntity: any = { ...entity, internalFolderCount: 0 };
    if (entity.children.length > 0) {
      newEntity.internalFolderCount = entity.children.length;
      const children = [];
      for (const item of entity.children) {
        if (item.projects.length > 0) {
          item.projects = item.projects.map((project) => {
            return {
              id: project.id,
              projectName: project.projectName,
              users: [],
              tags: [],
              available: !!project.users.find((user) => user.id == userId),
            } as any;
          });
        }
        children.push(this.countHelper(item, userId));
      }
      newEntity.children = children;
    }
    newEntity.available = !!newEntity.users.find(
      (user: UserEntity) => user.id == userId,
    );
    newEntity.users = [];
    return newEntity;
  }
}
