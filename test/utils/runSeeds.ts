import { join } from 'path';
import { createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import process from 'process';

export const runSeeds = async () => {
  const seedsDirectory = join(__dirname, '../../src/modules/db/seeds/*.ts');
  const entitiesDirectory = join(
    __dirname,
    '../../src/modules/**/entities/*.entity.ts',
  );
  const connection = await createConnection({
    name: 'seeds',
    type: 'postgres',
    database: process.env.TEST_DB,
    logging: false,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    port: +process.env.DB_PORT_TEST,
    synchronize: false,
    migrationsRun: true,
    migrationsTableName: 'seeds',
    entities: [entitiesDirectory],
    migrations: [seedsDirectory],
    cli: {
      migrationsDir: './src/modules/db/seeds',
    },
    namingStrategy: new SnakeNamingStrategy(),
  });

  await connection.runMigrations({
    transaction: 'all',
  });
  await connection.close();
};
