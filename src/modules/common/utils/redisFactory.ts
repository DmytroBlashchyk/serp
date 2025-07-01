import { ConfigService } from '@nestjs/config';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { RedisOptions } from 'ioredis';

/**
 * Creates a RedisOptions object using the provided configuration.
 *
 * @param {ConfigService} config - The configuration service used to retrieve Redis settings.
 * @return {RedisOptions} An object containing Redis connection options such as host, port, and database index.
 */
export function redisFactory(config: ConfigService): RedisOptions {
  const host = config.get(ConfigEnvEnum.REDIS_HOST);
  const port = config.get(ConfigEnvEnum.REDIS_PORT);
  const db = config.get(ConfigEnvEnum.REDIS_DB);

  return {
    host,
    port,
    db,
  };
}
