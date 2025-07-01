import { join } from 'path';
import { createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import process from 'process';

export const runMigrations = async () => {
  const seedsDirectory = join(
    __dirname,
    '../../src/modules/db/migrations/*.ts',
  );
  const entitiesDirectory = join(
    __dirname,
    '../../src/modules/**/entities/*.entity.ts',
  );

  const connection = await createConnection({
    name: 'migrations',
    type: 'postgres',
    database: process.env.TEST_DB,
    logging: false,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: +process.env.DB_PORT_TEST,
    synchronize: true,
    migrationsRun: false,
    dropSchema: true,
    migrationsTableName: 'migrations',
    entities: [entitiesDirectory],
    migrations: [seedsDirectory],
    cli: {
      migrationsDir: './src/modules/db/migrations',
    },
    namingStrategy: new SnakeNamingStrategy(),
  });

  await connection.synchronize();
  await connection.close();
};
