import { BaseRepository } from 'typeorm-transactional-cls-hooked';

import { Injectable } from '@nestjs/common';
import { EntityRepository, In } from 'typeorm';
import { GetTagsType } from 'modules/tags/types/get-tags.type';
import { IdType } from 'modules/common/types/id-type.type';
import { ProjectTagEntity } from 'modules/tags/entities/project-tag.entity';

@Injectable()
@EntityRepository(ProjectTagEntity)
export class ProjectTagRepository extends BaseRepository<ProjectTagEntity> {
  /**
   * Fetches tags based on an array of tag IDs.
   *
   * @param {IdType[]} ids - An array of tag IDs to retrieve.
   * @return {Promise<ProjectTagEntity[]>} A promise that resolves to an array of ProjectTagEntity objects corresponding to the provided IDs.
   */
  async getTagsByIds(ids: IdType[]): Promise<ProjectTagEntity[]> {
    return this.find({ where: { id: In(ids) } });
  }

  /**
   * Fetches an array of ProjectTagEntity corresponding to a specific project identified by the projectId.
   *
   * @param {IdType} projectId - The unique identifier of the project for which tags are to be fetched.
   * @return {Promise<ProjectTagEntity[]>} - A promise that resolves to an array of ProjectTagEntity objects associated with the project.
   */
  async getProjectTagsByProjectId(
    projectId: IdType,
  ): Promise<ProjectTagEntity[]> {
    return this.createQueryBuilder('projects_tags')
      .leftJoin('projects_tags.projects', 'projects')
      .where('projects.id =:projectId', { projectId })
      .getMany();
  }

  /**
   * Retrieves project tags associated with a specific account.
   *
   * @param {GetTagsType} options - The search criteria including account ID and an optional search string.
   * @return {Promise<ProjectTagEntity[]>} - A promise resolving to an array of project tags.
   */
  async getAccountProjectTags(
    options: GetTagsType,
  ): Promise<ProjectTagEntity[]> {
    const querySearch = options.search ? ` AND tags.name ILike(:search)` : '';
    const queryBuilder = this.createQueryBuilder('tags')
      .leftJoinAndSelect('tags.projects', 'projects')
      .where(`projects.account_id =:accountId ${querySearch}`, {
        accountId: options.accountId,
        search: `%${options.search}%`,
      });
    return queryBuilder.getMany();
  }
}
