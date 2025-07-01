import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { CountryEntity } from 'modules/countries/entities/country.entity';
import { EntityRepository } from 'typeorm';

@Injectable()
@EntityRepository(CountryEntity)
export class CountryRepository extends BaseRepository<CountryEntity> {
  /**
   * Retrieves a country entity by its name.
   *
   * @param {string} name - The name of the country to retrieve.
   * @return {Promise<CountryEntity>} A promise that resolves to the country entity.
   */
  async getCountryByName(name: string): Promise<CountryEntity> {
    return this.findOne({
      where: {
        name,
      },
    });
  }
}
