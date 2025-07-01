import { Injectable, NotFoundException } from '@nestjs/common';
import { CountryRepository } from 'modules/countries/repositories/country.repository';
import { CountriesResponse } from 'modules/countries/responses/countries.response';
import { CountryEntity } from 'modules/countries/entities/country.entity';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
export class CountriesService {
  constructor(private readonly countryRepository: CountryRepository) {}

  /**
   * Retrieves all countries from the repository.
   *
   * @return {Promise<CountriesResponse>} A promise that resolves to an instance of CountriesResponse
   * containing the list of all countries.
   */
  async getAllCountries(): Promise<CountriesResponse> {
    const countries = await this.countryRepository.find();
    return new CountriesResponse({
      items: countries,
    });
  }

  /**
   * Retrieves a country by its name.
   *
   * @param {string} name - The name of the country to retrieve.
   * @return {Promise<CountryEntity>} The details of the country if found.
   * @throws {NotFoundException} If the country with the specified name is not found.
   */
  async getCountry(name: string): Promise<CountryEntity> {
    const country = await this.countryRepository.getCountryByName(name);
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    return country;
  }

  /**
   * Retrieves an existing country by its identifier.
   *
   * @param {IdType} countryId - The unique identifier of the country to be retrieved.
   * @return {Promise<CountryEntity>} A promise that resolves to the found country entity.
   * @throws {NotFoundException} If the country with the given identifier is not found.
   */
  async getExistingCountry(countryId: IdType): Promise<CountryEntity> {
    const country = await this.countryRepository.findOne(countryId);
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    return country;
  }
}
