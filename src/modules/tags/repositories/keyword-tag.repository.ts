import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { KeywordTagEntity } from 'modules/tags/entities/keyword-tag.entity';
import { EntityRepository, In } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { IdType } from 'modules/common/types/id-type.type';
import { GetTagsType } from 'modules/tags/types/get-tags.type';

@Injectable()
@EntityRepository(KeywordTagEntity)
export class KeywordTagRepository extends BaseRepository<KeywordTagEntity> {
  /**
   * Retrieves keyword tags associated with a specific project ID.
   *
   * @param {IdType} projectId - The ID of the project for which to retrieve keyword tags.
   * @return {Promise<KeywordTagEntity[]>} - A promise that resolves to an array of KeywordTagEntity objects.
   */
  async getKeywordTagsByProjectId(
    projectId: IdType,
  ): Promise<KeywordTagEntity[]> {
    return this.createQueryBuilder('keywords_tags')
      .leftJoinAndSelect('keywords_tags.keywords', 'keywords')
      .leftJoin('keywords.project', 'project')
      .where('project.id =:projectId', { projectId })
      .getMany();
  }

  async getKeywordTagsByKeywordId(id: IdType): Promise<KeywordTagEntity[]> {
    return this.createQueryBuilder('keywords_tags')
      .leftJoinAndSelect('keywords_tags.keywords', 'keywords')
      .where('keywords.id =:id', { id })
      .getMany();
  }

  /**
   * Retrieve a list of tags that match the provided IDs.
   *
   * @param {IdType[]} ids - An array of IDs used to identify the tags.
   * @return {Promise<KeywordTagEntity[]>} A promise that resolves to an array of `KeywordTagEntity` objects that correspond to the given IDs.
   */
  async getTagsByIds(ids: IdType[]): Promise<KeywordTagEntity[]> {
    return this.find({ where: { id: In(ids) } });
  }

  /**
   * Retrieves keyword tags associated with a specific account.
   * Allows filtering by a search term.
   *
   * @param {Object} options - Options for querying keyword tags.
   * @param {string} options.accountId - The ID of the account to retrieve keyword tags for.
   * @param {string} [options.search] - An optional search term to filter the keyword tags by name.
   *
   * @return {Promise<KeywordTagEntity[]>} - A promise that resolves to an array of keyword tag entities.
   */
  async getAccountKeywordTags(
    options: GetTagsType,
  ): Promise<KeywordTagEntity[]> {
    const querySearch = options.search
      ? ` AND keywords_tags.name ILike(:search)`
      : '';
    const queryBuilder = this.createQueryBuilder('keywords_tags')
      .leftJoinAndSelect('keywords_tags.keywords', 'keywords')
      .leftJoinAndSelect('keywords.project', 'project')
      .where(`project.account_id =:accountId ${querySearch}`, {
        accountId: options.accountId,
        search: `%${options.search}%`,
      });
    return queryBuilder.getMany();
  }
}
