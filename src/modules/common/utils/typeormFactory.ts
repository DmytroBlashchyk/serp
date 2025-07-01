import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { Environments } from 'modules/common/enums/environments.enum';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

/**
 * Generates TypeORM configuration options based on the provided configuration service.
 *
 * @param {ConfigService} config - The configuration service instance to retrieve settings from.
 * @return {TypeOrmModuleOptions | Promise<TypeOrmModuleOptions>} The TypeORM module options configured based on the environment.
 */
export function typeormFactory(
  config: ConfigService,
): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
  const currentEnvironment = config.get<string>(ConfigEnvEnum.NODE_ENV);
  const environment = config.get<string>(ConfigEnvEnum.ENVIRONMENT);
  const isTesting = currentEnvironment === Environments.Testing;
  const sslConfig =
    environment === Environments.Production
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {};

  const slaveOptions: any = {
    host: config.get<string>(ConfigEnvEnum.DB_HOST_SLAVE),
    username: config.get<string>(ConfigEnvEnum.DB_USER),
    password: config.get<string>(ConfigEnvEnum.DB_PASSWORD),
    ...sslConfig,
  };
  return {
    type: 'postgres',
    entities: [join(__dirname, '/../../../**/**.entity{.js,.ts}')],
    migrationsTableName: 'migrations',
    synchronize: false,
    dropSchema: false,
    migrationsRun: !isTesting,
    cli: {
      migrationsDir: 'src/modules/db/migrations',
    },
    logging: config.get<boolean>(ConfigEnvEnum.DB_LOGGING),
    logger: 'advanced-console',
    namingStrategy: new SnakeNamingStrategy(),
    replication: {
      master: {
        host: config.get<string>(ConfigEnvEnum.DB_HOST_MASTER),
        username: config.get<string>(ConfigEnvEnum.DB_USER),
        password: config.get<string>(ConfigEnvEnum.DB_PASSWORD),
        ...sslConfig,
      },
      slaves: [slaveOptions],
    },
    ...sslConfig,
  };
}
