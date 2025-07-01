import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SearchResultEntity } from 'modules/keywords/entities/search-result.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { CreateKeywordsResultsType } from 'modules/keywords/types/create-keywords-results.type';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(SearchResultEntity)
export class SearchResultRepository extends BaseRepository<SearchResultEntity> {
  /**
   * Retrieves the most recent search result for a given keyword ID.
   *
   * @param {IdType} keywordId - The ID of the keyword associated with the search result.
   * @return {Promise<SearchResultEntity>} The most recent search result associated with the given keyword ID.
   */
  async getLastSearchResultByKeywordId(
    keywordId: IdType,
  ): Promise<SearchResultEntity> {
    return this.createQueryBuilder('search_results')
      .leftJoinAndSelect('search_results.keyword', 'keyword')
      .where('keyword.id =:keywordId', { keywordId })
      .orderBy('search_results.id', 'DESC')
      .getOne();
  }

  /**
   * Creates and saves a list of keyword search results.
   *
   * @param {CreateKeywordsResultsType[]} keywordResults - An array of objects containing keyword IDs and corresponding search results.
   * @return {Promise<SearchResultEntity[]>} A promise that resolves to an array of saved search result entities.
   */
  createKeywordsResults(
    keywordResults: CreateKeywordsResultsType[],
  ): Promise<SearchResultEntity[]> {
    return this.save(
      keywordResults.map((item) => {
        return { keyword: { id: item.keywordId }, result: item.result };
      }),
    );
  }
}
