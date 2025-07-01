import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchEngineRepository } from 'modules/search-engines/repositories/search-engine.repository';
import { SearchEnginesResponse } from 'modules/search-engines/responses/search-engines.response';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';
import { SearchEngineEntity } from 'modules/search-engines/entities/search-engine.entity';

@Injectable()
export class SearchEnginesService {
  constructor(
    private readonly searchEngineRepository: SearchEngineRepository,
  ) {}

  /**
   * Retrieves all search engines from the repository.
   *
   * @return {Promise<SearchEnginesResponse>} A promise that resolves to a SearchEnginesResponse containing all search engines.
   */
  async getAll(): Promise<SearchEnginesResponse> {
    const searchEngines = await this.searchEngineRepository.find();
    return new SearchEnginesResponse({ items: searchEngines });
  }

  /**
   * Retrieves a search engine entity by its name.
   *
   * @param {SearchEnginesEnum} name - The name of the search engine to retrieve.
   * @return {Promise<SearchEngineEntity>} A promise that resolves to the search engine entity.
   * @throws {NotFoundException} Thrown if the search engine is not found.
   */
  async getSearchEngine(name: SearchEnginesEnum): Promise<SearchEngineEntity> {
    const searchEngine =
      await this.searchEngineRepository.getSearchEngineByName(name);
    if (!searchEngine) {
      throw new NotFoundException('Search Engine not found.');
    }
    return searchEngine;
  }
}
