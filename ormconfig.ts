import * as process from 'process';

require('dotenv').config({ path: '../.env' });

import type { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { logging } from '@angular-devkit/core';

console.log(
  `TypeOrm is configured to connect to: ${process.env.DB_NAME}, NODE_ENV=${process.env.NODE_ENV}`,
);

const isProduction = process.env.NODE_ENV === 'production';
const production = process.env.ENVIRONMENT === 'production';
const sslConfig = production
  ? {
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {};

const config: Array<ConnectionOptions> = [
  {
    type: 'postgres',
    entities: isProduction
      ? [__dirname + '/dist/src/modules/**/entities/*.entity.js']
      : [__dirname + '/src/modules/**/entities/*.entity.ts'],
    database: process.env.DB_NAME,
    logging: true,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT_MASTER ?? '5432'),
    synchronize: false,
    migrationsRun: true,
    migrationsTableName: 'migrations',
    migrations: isProduction
      ? [__dirname + '/dist/src/modules/db/migrations./*.js']
      : [__dirname + '/src/modules/db/migrations/*.ts'],
    cli: {
      migrationsDir: './src/modules/db/migrations',
    },
    namingStrategy: new SnakeNamingStrategy(),
    ...sslConfig,
  },
  {
    name: 'seeds',
    type: 'postgres',
    database: process.env.DB_NAME,
    logging: true,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT_MASTER ?? '5432'),
    synchronize: false,
    migrationsRun: true,
    migrationsTableName: 'seeds',
    entities: isProduction
      ? [__dirname + '/dist/src/modules/**/entities/*.entity.js']
      : [__dirname + '/src/modules/**/entities/*.ts'],
    migrations: isProduction
      ? [__dirname + '/dist/src/modules/db/seeds/*.js']
      : [__dirname + '/src/modules/db/seeds/*.ts'],
    cli: {
      migrationsDir: './src/modules/db/seeds',
    },
    namingStrategy: new SnakeNamingStrategy(),
    ...sslConfig,
  },
];

export default config;
