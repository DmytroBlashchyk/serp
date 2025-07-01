import { CheckFrequencyEntity } from 'modules/check-frequency/entities/check-frequency.entity';
import { CheckFrequencyEnum } from 'modules/check-frequency/enums/check-frequency.enum';

export abstract class BaseCacheTransformer {
  /**
   * Calculates the cache lifetime based on the provided check frequency.
   *
   * @param {CheckFrequencyEntity} checkFrequency - The frequency at which the checks are performed.
   * @return {Promise<number>} A promise that resolves to the cache lifetime in seconds.
   */
  async cacheLifetime(checkFrequency: CheckFrequencyEntity): Promise<number> {
    switch (checkFrequency.name) {
      case CheckFrequencyEnum.Hours24:
        return 86400;
      case CheckFrequencyEnum.Every2Days:
        return 2 * 86400;
      case CheckFrequencyEnum.Every3Days:
        return 3 * 86400;
      case CheckFrequencyEnum.EveryWeek:
        return 7 * 86400;
      case CheckFrequencyEnum.EveryMonth:
        return 30 * 86400;
      case CheckFrequencyEnum.Every2Months:
        return 2 * 30 * 86400;
      case CheckFrequencyEnum.Every3Months:
        return 3 * 30 * 86400;
      case CheckFrequencyEnum.Every6Months:
        return 6 * 30 * 86400;
      case CheckFrequencyEnum.EveryYear:
        return 365 * 86400;
      default:
        return 86400;
    }
  }
}
