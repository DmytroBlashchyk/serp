import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigEnvEnum } from 'modules/common/enums/config-env.enum';
import { Environments } from 'modules/common/enums/environments.enum';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export function typeormTestFactory(
  config: ConfigService,
): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
  const currentEnvironment = config.get<string>(ConfigEnvEnum.NODE_ENV);
  const isTesting = currentEnvironment === Environments.Testing;

  return {
    type: 'postgres',
    entities: ['src/modules/**/**/**.entity{.js,.ts}'],
    migrationsTableName: 'migrations',
    synchronize: false,
    username: config.get(ConfigEnvEnum.DB_USER),
    password: config.get(ConfigEnvEnum.DB_PASSWORD),
    database: config.get(ConfigEnvEnum.TEST_DB),
    port: +config.get(ConfigEnvEnum.DB_PORT_TEST),
    dropSchema: false,
    migrationsRun: !isTesting,
    cli: {
      migrationsDir: 'src/modules/db/migrations',
    },
    logging: false,
    logger: 'advanced-console',
    namingStrategy: new SnakeNamingStrategy(),
  };
}
