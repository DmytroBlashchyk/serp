import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { TimezoneEntity } from 'modules/timezones/entities/timezone.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';

@Injectable()
@EntityRepository(TimezoneEntity)
export class TimezoneRepository extends BaseRepository<TimezoneEntity> {
  /**
   * Retrieves all timezone records from the database, ordered by their name.
   *
   * @return {Promise<Array>} A promise that resolves to an array of timezone objects.
   */
  async getAll() {
    return this.createQueryBuilder('timezones')
      .orderBy('timezones.name')
      .getMany();
  }

  /**
   * Retrieves a timezone entity based on the provided name.
   *
   * @param {string} name - The name of the timezone to retrieve.
   * @return {Promise<TimezoneEntity>} - A promise that resolves to the timezone entity if found.
   */
  async getTimezoneByName(name: string): Promise<TimezoneEntity> {
    return this.findOne({
      where: {
        name,
      },
    });
  }
}
