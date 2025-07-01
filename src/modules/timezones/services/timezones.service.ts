import { Injectable, NotFoundException } from '@nestjs/common';
import { TimezoneRepository } from 'modules/timezones/repositories/timezone.repository';
import { TimezonesResponse } from 'modules/timezones/responses/timezones.response';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';
import { IdType } from 'modules/common/types/id-type.type';
import { TimezonesResponseFactory } from 'modules/timezones/factories/timezones-response.factory';

@Injectable()
export class TimezonesService {
  constructor(
    private readonly timezoneRepository: TimezoneRepository,
    private readonly timezonesResponseFactory: TimezonesResponseFactory,
  ) {}

  /**
   * Fetches all available timezones from the repository and creates a response.
   *
   * @return {Promise<TimezonesResponse>} A promise that resolves to an object containing the timezone data.
   */
  async getAllTimezones(): Promise<TimezonesResponse> {
    const timezones = await this.timezoneRepository.getAll();
    return this.timezonesResponseFactory.createResponse(timezones);
  }

  /**
   * Retrieves the timezone information based on the provided name.
   *
   * @param {string} name - The name of the timezone to retrieve.
   * @return {Promise<TimezoneEntity>} - A promise that resolves to the TimezoneEntity object.
   * @throws {NotFoundException} - If the timezone is not found.
   */
  async getTimezone(name: string): Promise<TimezoneEntity> {
    const timezone = await this.timezoneRepository.getTimezoneByName(name);
    if (!timezone) {
      throw new NotFoundException('Timezone not found');
    }
    return timezone;
  }

  /**
   * Retrieves an existing timezone entity by its identifier.
   *
   * @param {IdType} timezoneId - The identifier of the timezone to retrieve.
   * @return {Promise<TimezoneEntity>} A promise that resolves to the retrieved timezone entity.
   * @throws {NotFoundException} If no timezone is found with the given identifier.
   */
  async getExistingTimezone(timezoneId: IdType): Promise<TimezoneEntity> {
    const timezone = await this.timezoneRepository.findOne(timezoneId);
    if (!timezone) {
      throw new NotFoundException('Timezone not found');
    }
    return timezone;
  }
}
