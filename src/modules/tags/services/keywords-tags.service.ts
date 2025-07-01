import { Injectable } from '@nestjs/common';
import { KeywordTagRepository } from 'modules/tags/repositories/keyword-tag.repository';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { IdType } from 'modules/common/types/id-type.type';
import { TagsResponse } from 'modules/tags/responses/tags.response';
import { GetTagsType } from 'modules/tags/types/get-tags.type';

@Injectable()
export class KeywordsTagsService {
  constructor(private readonly keywordTagRepository: KeywordTagRepository) {}

  /**
   * Retrieves keyword tags associated with an account based on the provided payload.
   *
   * @param {GetTagsType} payload - The data required to fetch the keyword tags.
   * @return {Promise<TagsResponse>} A promise that resolves to a TagsResponse object containing the keyword tags.
   */
  async getKeywordTags(payload: GetTagsType): Promise<TagsResponse> {
    const tags = await this.keywordTagRepository.getAccountKeywordTags(payload);
    return new TagsResponse({ items: tags });
  }

  /**
   * Retrieves tags by their unique identifiers.
   *
   * @param {IdType[]} ids - The unique identifiers of the tags to retrieve.
   * @returns {Promise<KeywordTagEntity[]>} A promise that resolves to an array of tags.
   */
  async getTagsByIds(ids: IdType[]): Promise<KeywordTagEntity[]> {
    return this.keywordTagRepository.getTagsByIds(ids);
  }

  /**
   * Creates new keyword tags and saves them to the repository.
   *
   * @param {string[]} tags - An array of tag names to be created.
   * @return {Promise<KeywordTagEntity[]>} - A Promise that resolves to an array of created KeywordTagEntity objects.
   */
  async createTags(tags: string[]): Promise<KeywordTagEntity[]> {
    const newTags: KeywordTagEntity[] = [];
    for (const tag of tags) {
      newTags.push(await this.keywordTagRepository.create({ name: tag }));
    }
    return this.keywordTagRepository.save(newTags);
  }

  /**
   * Retrieves keyword tags associated with a specific project.
   *
   * @param {IdType} projectId - The unique identifier of the project.
   * @return {Promise<KeywordTagEntity[]>} A promise that resolves to an array of keyword tag entities.
   */
  async getProjectKeywordTags(projectId: IdType): Promise<KeywordTagEntity[]> {
    return this.keywordTagRepository.getKeywordTagsByProjectId(projectId);
  }
}
