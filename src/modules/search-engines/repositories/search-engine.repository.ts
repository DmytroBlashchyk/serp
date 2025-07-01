import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { SearchEngineEntity } from 'modules/search-engines/entities/search-engine.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { SearchEnginesEnum } from 'modules/search-engines/enums/search-engines.enum';

@Injectable()
@EntityRepository(SearchEngineEntity)
export class SearchEngineRepository extends BaseRepository<SearchEngineEntity> {
  /**
   * Retrieves a search engine entity by its name.
   *
   * @param {SearchEnginesEnum} name - The name of the search engine to find.
   * @return {Promise<SearchEngineEntity>} A promise that resolves to the search engine entity object.
   */
  async getSearchEngineByName(
    name: SearchEnginesEnum,
  ): Promise<SearchEngineEntity> {
    return this.findOne({ where: { name } });
  }
}
