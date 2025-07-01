import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { EntityRepository } from 'typeorm';
import { LocationEntity } from 'modules/countries/entities/location.entity';
import { Injectable } from '@nestjs/common';
import { LocationType } from 'modules/countries/types/location.type';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { IdType } from 'modules/common/types/id-type.type';

@Injectable()
@EntityRepository(LocationEntity)
export class LocationRepository extends BaseRepository<LocationEntity> {
  /**
   * Retrieves a location entity by its ID for YouTube-specific entries.
   *
   * @param {IdType} id - The unique identifier of the location.
   * @return {Promise<LocationEntity>} The location entity if found.
   */
  async getLocationByIdForYoutube(id: IdType): Promise<LocationEntity> {
    return this.createQueryBuilder('locations')
      .where('locations.id =:id and locations.serpYouTube is true', { id })
      .getOne();
  }

  /**
   * Fetches the location details by its ID, filtered specifically for Bing searches.
   *
   * @param {IdType} id - The unique identifier of the location.
   * @return {Promise<LocationEntity>} - A promise that resolves to the location entity if found.
   */
  async getLocationByIdForBing(id: IdType): Promise<LocationEntity> {
    return this.createQueryBuilder('locations')
      .where('locations.id =:id and locations.serpBing is true', { id })
      .getOne();
  }

  /**
   * Retrieves a location entity by its ID specifically for Yahoo search results.
   *
   * @param {IdType} id - The unique identifier of the location.
   * @return {Promise<LocationEntity>} The location entity matching the provided ID and having Yahoo search results enabled.
   */
  async getLocationByIdForYahoo(id: IdType): Promise<LocationEntity> {
    return this.createQueryBuilder('locations')
      .where('locations.id =:id and locations.serpYahoo is true', { id })
      .getOne();
  }

  /**
   * Retrieves a location entity by its ID, specifically for Baidu search results.
   *
   * @param {IdType} id - The unique identifier of the location.
   * @return {Promise<LocationEntity>} - A promise that resolves to the location entity.
   */
  async getLocationByIdForBaidu(id: IdType): Promise<LocationEntity> {
    return this.createQueryBuilder('locations')
      .where('locations.id =:id and locations.serpBaidu is true', { id })
      .getOne();
  }

  /**
   * Retrieves a LocationEntity by its ID for Google-specific purposes.
   * The method queries the database for a location where the id matches the provided id
   * and the serp property is true.
   *
   * @param {IdType} id - The ID of the location to be retrieved.
   * @return {Promise<LocationEntity>} A promise that resolves to the LocationEntity object if found.
   */
  async getLocationByIdForGoogle(id: IdType): Promise<LocationEntity> {
    return this.createQueryBuilder('locations')
      .where('locations.id =:id and locations.serp is true', { id })
      .getOne();
  }

  /**
   * Retrieves paginated locations matching the search query for Yahoo.
   *
   * @param {string} search - The search term to filter locations by name.
   * @param {PaginatedQueryRequest} options - The pagination options including limit and page number.
   * @return {Promise<Pagination<LocationType>>} - A promise that resolves to a paginated list of locations.
   */
  async getLocationsForYahoo(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<Pagination<LocationEntity>> {
    const searchQuery = search
      ? `
    and (
      locations.locationName = :strictSearch
      OR locations.locationName ILIKE :partialSearch
    )`
      : '';
    const queryBuilder = this.createQueryBuilder('locations')
      .select(['locations.id', 'locations.locationName'])
      .where(`locations.serpYahoo is TRUE ${searchQuery}`, {
        strictSearch: search,
        partialSearch: search ? `%${search}%` : `%%`,
      })
      .orderBy(
        `CASE
      WHEN locations.locationName = :strictSearch THEN 0
      ELSE 1
    END`,
        'ASC',
      )
      .addOrderBy('locations.locationName', 'ASC');
    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    });
  }

  /**
   * Fetches a paginated list of locations from the database that match the search criteria
   * specifically for Baidu. Locations are filtered based on the presence of 'serp_baidu' in their metadata.
   *
   * @param {string} search - The search term to filter locations by name.
   * @param {PaginatedQueryRequest} options - The pagination options including limit and page number.
   * @return {Promise<Pagination<LocationType>>} - A promise that resolves to a paginated list of locations.
   */
  async getLocationsForBaidu(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<Pagination<LocationEntity>> {
    const searchQuery = search
      ? `
    and (
      locations.locationName = :strictSearch
      OR locations.locationName ILIKE :partialSearch
    )`
      : '';
    const queryBuilder = this.createQueryBuilder('locations')
      .select(['locations.id', 'locations.locationName'])
      .where(`locations.serpBaidu is TRUE ${searchQuery}`, {
        strictSearch: search,
        partialSearch: search ? `%${search}%` : `%%`,
      })
      .orderBy(
        `CASE
      WHEN locations.locationName = :strictSearch THEN 0
      ELSE 1
    END`,
        'ASC',
      )
      .addOrderBy('locations.locationName', 'ASC');
    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    });
  }

  /**
   * Retrieves a paginated list of YouTube-enabled locations based on a search query.
   *
   * @param {string} search - The search query to filter locations by name.
   * @param {PaginatedQueryRequest} options - The pagination options including limit and page number.
   * @return {Promise<Pagination<LocationType>>} A promise that resolves to a paginated list of locations.
   */
  async getLocationsForYoutube(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<Pagination<LocationEntity>> {
    const searchQuery = search
      ? `
    and (
      locations.locationName = :strictSearch
      OR locations.locationName ILIKE :partialSearch
    )`
      : '';
    const queryBuilder = this.createQueryBuilder('locations')
      .select(['locations.id', 'locations.locationName'])
      .where(`locations.serpYouTube is TRUE ${searchQuery}`, {
        strictSearch: search,
        partialSearch: search ? `%${search}%` : `%%`,
      })
      .orderBy(
        `CASE
      WHEN locations.locationName = :strictSearch THEN 0
      ELSE 1
    END`,
        'ASC',
      )
      .addOrderBy('locations.locationName', 'ASC');
    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    });
  }

  /**
   * Retrieves a paginated list of locations from the database based on the search term,
   * and filters for those that are enabled for Bing SERP.
   *
   * @param {string} search - The search term to filter locations by name.
   * @param {PaginatedQueryRequest} options - Pagination options including limit and page.
   * @return {Promise<Pagination<LocationType>>} A promise that resolves to the paginated list of locations.
   */
  async getLocationsForBing(
    options: PaginatedQueryRequest,
    search: string,
  ): Promise<Pagination<LocationEntity>> {
    const searchQuery = search
      ? `
    and (
      locations.locationName = :strictSearch
      OR locations.locationName ILIKE :partialSearch
    )`
      : '';
    const queryBuilder = this.createQueryBuilder('locations')
      .select(['locations.id', 'locations.locationName'])
      .where(`locations.serpBing is TRUE ${searchQuery}`, {
        strictSearch: search,
        partialSearch: search ? `%${search}%` : `%%`,
      })
      .orderBy(
        `CASE
      WHEN locations.locationName = :strictSearch THEN 0
      ELSE 1
    END`,
        'ASC',
      )
      .addOrderBy('locations.locationName', 'ASC');
    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    });
  }

  /**
   * Retrieves locations based on a search query with pagination support.
   *
   * @param {string} search - The search string to filter locations.
   * @param {PaginatedQueryRequest} options - Pagination options including limit and page number.
   * @return {Promise<Pagination<LocationType>>} A promise that resolves to a paginated list of locations.
   */
  async getLocationsForGoogle(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<Pagination<LocationEntity>> {
    const searchQuery = search
      ? `
    and (
      locations.locationName = :strictSearch
      OR locations.locationName ILIKE :partialSearch
    )`
      : '';
    const queryBuilder = this.createQueryBuilder('locations')
      .select(['locations.id', 'locations.locationName'])
      .where(`locations.serp is TRUE ${searchQuery}`, {
        strictSearch: search,
        partialSearch: search ? `%${search}%` : `%%`,
      })
      .orderBy(
        `CASE
      WHEN locations.locationName = :strictSearch THEN 0
      ELSE 1
    END`,
        'ASC',
      )
      .addOrderBy('locations.locationName', 'ASC');
    return paginate(queryBuilder, {
      page: options.page,
      limit: options.limit,
    });
  }
}
