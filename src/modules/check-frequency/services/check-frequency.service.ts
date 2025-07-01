import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckFrequencyRepository } from 'modules/check-frequency/repositories/check-frequency.repository';
import { CheckFrequenciesResponse } from 'modules/check-frequency/responses/check-frequencies.response';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';
import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';

@Injectable()
export class CheckFrequencyService {
  constructor(
    private readonly checkFrequencyRepository: CheckFrequencyRepository,
  ) {}

  /**
   * Fetches all check frequencies.
   *
   * @return {Promise<CheckFrequenciesResponse>} A promise that resolves to a CheckFrequenciesResponse object containing all check frequencies.
   */
  async getAll(): Promise<CheckFrequenciesResponse> {
    const checkFrequency = await this.checkFrequencyRepository.getAll();
    return new CheckFrequenciesResponse({ items: checkFrequency });
  }

  /**
   * Retrieves the check frequency entity based on the provided name.
   *
   * @param {CheckFrequencyEnum} name - The name of the check frequency to retrieve.
   * @return {Promise<CheckFrequencyEntity>} - A promise that resolves to the check frequency entity.
   * @throws {NotFoundException} Throws if the check frequency is not found.
   */
  async getCheckFrequency(
    name: CheckFrequencyEnum,
  ): Promise<CheckFrequencyEntity> {
    const checkFrequency =
      await this.checkFrequencyRepository.getCheckFrequencyByName(name);
    if (!checkFrequency) {
      throw new NotFoundException('Check Frequency not found.');
    }
    return checkFrequency;
  }
}
