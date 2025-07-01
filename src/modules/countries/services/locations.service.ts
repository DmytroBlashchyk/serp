import { Injectable, NotFoundException } from '@nestjs/common';
import { LocationRepository } from 'modules/countries/repositories/location.repository';
import { PaginatedQueryRequest } from 'modules/common/requests/paginated-query.request';
import { LocationsResponse } from 'modules/countries/responses/locations.response';
import { LocationResponse } from 'modules/countries/responses/location.response';
import { IdType } from 'modules/common/types/id-type.type';
import { LocationEntity } from 'modules/countries/entities/location.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queues } from 'modules/queue/enums/queues.enum';
import { Queue } from 'bull';
import { QueueEventEnum } from 'modules/queue/enums/queue-event.enum';
import { CliLoggingService } from 'modules/logging/services/cli-logging.service';
import { DataForSeoService } from 'modules/additional-services/services/data-for-seo.service';

@Injectable()
export class LocationsService {
  constructor(private readonly locationRepository: LocationRepository) {}

  /**
   * Retrieves the location information for a given YouTube ID.
   *
   * @param {IdType} id - The ID of the YouTube location to retrieve.
   * @return {Promise<LocationEntity>} A promise that resolves to the location entity.
   * @throws {NotFoundException} If the location is not found.
   */
  async getLocationForYoutube(id: IdType): Promise<LocationEntity> {
    const location = await this.locationRepository.getLocationByIdForYoutube(
      id,
    );

    if (!location) {
      throw new NotFoundException('Location not found.');
    }
    return location;
  }

  /**
   * Retrieves the location details for Bing based on the provided ID.
   *
   * @param {IdType} id - The unique identifier of the location to be fetched.
   * @return {Promise<LocationEntity>} The promise resolving to the location entity object.
   * @throws {NotFoundException} Throws an exception if the location is not found.
   */
  async getLocationForBing(id: IdType): Promise<LocationEntity> {
    const location = await this.locationRepository.getLocationByIdForBing(id);

    if (!location) {
      throw new NotFoundException('Location not found.');
    }
    return location;
  }

  /**
   * Retrieves the location details for Yahoo based on the provided location ID.
   *
   * @param {IdType} id - The unique identifier of the location.
   * @return {Promise<LocationEntity>} - A promise that resolves to the location entity.
   * @throws {NotFoundException} - If the location is not found.
   */
  async getLocationForYahoo(id: IdType): Promise<LocationEntity> {
    const location = await this.locationRepository.getLocationByIdForYahoo(id);

    if (!location) {
      throw new NotFoundException('Location not found.');
    }
    return location;
  }

  /**
   * Retrieves the location information for a given Baidu ID.
   *
   * @param {IdType} id - The ID of the location to retrieve.
   * @return {Promise<LocationEntity>} A promise that resolves to the location entity.
   * @throws {NotFoundException} Thrown if the location is not found.
   */
  async getLocationForBaidu(id: IdType): Promise<LocationEntity> {
    const location = await this.locationRepository.getLocationByIdForBaidu(id);

    if (!location) {
      throw new NotFoundException('Location not found.');
    }
    return location;
  }

  /**
   * Retrieves the location information for Google by a given ID.
   *
   * @param {IdType} id - The unique identifier of the location to retrieve.
   * @return {Promise<LocationEntity>} A promise that resolves to the location entity.
   * @throws {NotFoundException} If the location is not found.
   */
  async getLocationForGoogle(id: IdType): Promise<LocationEntity> {
    const location = await this.locationRepository.getLocationByIdForGoogle(id);

    if (!location) {
      throw new NotFoundException('Location not found.');
    }
    return location;
  }

  /**
   * Retrieves a paginated list of locations based on the search query and pagination options.
   *
   * @param {string} search - The search query to filter locations.
   * @param {PaginatedQueryRequest} options - Pagination options for the query.
   * @return {Promise<LocationsResponse>} A promise resolving to the locations response containing items and metadata.
   */
  async getLocationsForGoogle(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<LocationsResponse> {
    const { items, meta } = await this.locationRepository.getLocationsForGoogle(
      options,
      search,
    );
    return new LocationsResponse({
      items: items.map(
        (item) =>
          new LocationResponse({
            id: item.id,
            locationName: item.locationName,
          }),
      ),
      meta,
    });
  }

  /**
   * Retrieves locations for the Bing search query and returns a paginated response.
   *
   * @param {string} search - The search query string.
   * @param {PaginatedQueryRequest} options - The pagination options.
   * @return {Promise<LocationsResponse>} A promise that resolves with the locations response.
   */
  async getLocationsForBing(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<LocationsResponse> {
    const { items, meta } = await this.locationRepository.getLocationsForBing(
      options,
      search,
    );
    return new LocationsResponse({
      items: items.map(
        (item) =>
          new LocationResponse({
            id: item.id,
            locationName: item.locationName,
          }),
      ),
      meta,
    });
  }

  /**
   * Asynchronously retrieves locations associated with YouTube based on the search query and pagination options.
   *
   * @param {string} search - The search query string to find relevant YouTube locations.
   * @param {PaginatedQueryRequest} options - An object containing pagination options such as page number and page size.
   * @return {Promise<LocationsResponse>} A promise that resolves to a LocationsResponse object containing the list of locations and pagination metadata.
   */
  async getLocationsForYoutube(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<LocationsResponse> {
    const { items, meta } =
      await this.locationRepository.getLocationsForYoutube(options, search);
    return new LocationsResponse({
      items: items.map(
        (item) =>
          new LocationResponse({
            id: item.id,
            locationName: item.locationName,
          }),
      ),
      meta,
    });
  }

  /**
   * Fetches a paginated list of locations from Yahoo's services based on the search query.
   *
   * @param {string} search - The search term to query locations with Yahoo.
   * @param {PaginatedQueryRequest} options - The pagination options including page number and size.
   * @return {Promise<LocationsResponse>} - A promise that resolves to a LocationsResponse containing the list of locations and pagination metadata.
   */
  async getLocationsForYahoo(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<LocationsResponse> {
    const { items, meta } = await this.locationRepository.getLocationsForYahoo(
      options,
      search,
    );
    return new LocationsResponse({
      items: items.map(
        (item) =>
          new LocationResponse({
            id: item.id,
            locationName: item.locationName,
          }),
      ),
      meta,
    });
  }

  /**
   * Fetches a paginated list of locations from the Baidu mapping service based on the provided search query and options.
   *
   * @param {string} search - The search query used to find relevant locations.
   * @param {PaginatedQueryRequest} options - Pagination options including page number and page size.
   * @return {Promise<LocationsResponse>} A promise that resolves to a LocationsResponse containing the list of locations and metadata about the pagination.
   */
  async getLocationsForBaidu(
    options: PaginatedQueryRequest,
    search?: string,
  ): Promise<LocationsResponse> {
    const { items, meta } = await this.locationRepository.getLocationsForBaidu(
      options,
      search,
    );
    return new LocationsResponse({
      items: items.map(
        (item) =>
          new LocationResponse({
            id: item.id,
            locationName: item.locationName,
          }),
      ),
      meta,
    });
  }
}
