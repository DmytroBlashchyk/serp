import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Bottleneck from 'bottleneck';
import { redisFactory } from 'modules/common/utils/redisFactory';

export type RateLimiterWrapperFunction = <T>(wrappedFunction: T) => T;

interface RateLimiterParams {
  minTime: number;
  id: string;
}

@Injectable()
export class RateLimiterWrapperFactoryService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Spawns a new instance of a Rate Limiter with the given parameters.
   *
   * @param {Object} params - The parameters for the Rate Limiter.
   * @param {number} params.minTime - The minimum time to wait between actions.
   * @param {string} params.id - The identifier for the Rate Limiter instance.
   * @return {RateLimiterWrapperFunction} Returns a bound wrapper function for the Rate Limiter instance.
   */
  spawnInstance({
    minTime,
    id,
  }: RateLimiterParams): RateLimiterWrapperFunction {
    const limiter = new Bottleneck({
      minTime,
      id,
      maxConcurrent: 1,
      datastore: 'redis',
      clearDatastore: true,
      clientOptions: redisFactory(this.configService),
    });
    return limiter.wrap.bind(limiter);
  }
}
