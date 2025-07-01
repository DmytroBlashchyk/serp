import { testDatabaseCreation } from './testDatabaseCreation';

require('ts-node').register({
  extends: '../../tsconfig.json',
  transpileOnly: true,
});
require('tsconfig-paths/register');
import dotenv from 'dotenv';
dotenv.config();
import { runMigrations } from './runMigrations';
import { runSeeds } from './runSeeds';

module.exports = async (): Promise<void> => {
  await runMigrations();
  await runSeeds();
};
