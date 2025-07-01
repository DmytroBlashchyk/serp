import { BaseRepository } from 'typeorm-transactional-cls-hooked';
import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';
import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'typeorm';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';

@Injectable()
@EntityRepository(CheckFrequencyEntity)
export class CheckFrequencyRepository extends BaseRepository<CheckFrequencyEntity> {
  /**
   * Fetches all CheckFrequencyEntity records where the name is not equal to 'Now'.
   *
   * @return {Promise<CheckFrequencyEntity[]>} A promise that resolves to an array of CheckFrequencyEntity objects.
   */
  async getAll(): Promise<CheckFrequencyEntity[]> {
    return this.createQueryBuilder('check-frequency')
      .where('name !=:name', { name: CheckFrequencyEnum.Now })
      .getMany();
  }
  /**
   * Retrieves the check frequency entity based on the given name.
   *
   * @param {CheckFrequencyEnum} name - The name of the check frequency to be retrieved.
   * @return {Promise<CheckFrequencyEntity>} A promise that resolves to the CheckFrequencyEntity with the given name.
   */
  async getCheckFrequencyByName(
    name: CheckFrequencyEnum,
  ): Promise<CheckFrequencyEntity> {
    return this.findOne({ where: { name } });
  }
}
