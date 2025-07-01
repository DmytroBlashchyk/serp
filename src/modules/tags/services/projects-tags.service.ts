import { Injectable } from '@nestjs/common';
import { ProjectTagRepository } from 'modules/tags/repositories/project-tag.repository';
import { ProjectTagEntity } from 'modules/tags/entities/project-tag.entity';
import { GetTagsType } from 'modules/tags/types/get-tags.type';
import { TagsResponse } from 'modules/tags/responses/tags.response';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
export class ProjectsTagsService {
  constructor(private readonly tadRepository: ProjectTagRepository) {}

  /**
   * Retrieves tags by their IDs.
   *
   * @param {IdType[]} ids - An array of unique identifiers representing the tags.
   * @return {Promise<ProjectTagEntity[]>} A promise that resolves to an array of ProjectTagEntity objects.
   */
  async getTagsByIds(ids: IdType[]): Promise<ProjectTagEntity[]> {
    return this.tadRepository.getTagsByIds(ids);
  }

  /**
   * Retrieves the project tags based on the provided payload.
   *
   * @param {GetTagsType} payload - The information required to fetch the project tags.
   * @return {Promise<TagsResponse>} A promise that resolves to an object containing the project tags.
   */
  async getProjectTags(payload: GetTagsType): Promise<TagsResponse> {
    const tags = await this.tadRepository.getAccountProjectTags(payload);
    return new TagsResponse({ items: tags });
  }

  /**
   * Retrieves the project tags associated with a given project ID.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<ProjectTagEntity[]>} A promise that resolves to an array of project tags.
   */
  async getProjectTagsByProjectId(
    projectId: IdType,
  ): Promise<ProjectTagEntity[]> {
    return this.tadRepository.getProjectTagsByProjectId(projectId);
  }

  /**
   * Creates new tags and saves them to the repository.
   *
   * @param {string[]} tags - Array of tag names to be created.
   * @return {Promise<ProjectTagEntity[]>} - Promise that resolves to an array of saved ProjectTagEntity objects.
   */
  async createTags(tags: string[]): Promise<ProjectTagEntity[]> {
    const newTags: ProjectTagEntity[] = [];
    for (const tag of tags) {
      newTags.push(await this.tadRepository.create({ name: tag }));
    }
    return this.tadRepository.save(newTags);
  }
}
