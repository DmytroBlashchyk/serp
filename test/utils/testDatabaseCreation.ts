import process from 'process';
const { Client } = require('pg');

export const testDatabaseCreation = async (): Promise<void> => {
  const client = new Client({
    user: process.env.DB_USER,
    host: process.env.TEST_DB_HOST,
    database: 'postgres',
    password: process.env.TEST_DB_PASSWORD,
    port: process.env.DB_PORT_TEST,
  });
  try {
    await client.connect();
    const result = await client.query(
      "SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'develop';",
    );

    if (result.rowCount === 0) {
      await client.query('CREATE DATABASE develop;');
    }
  } catch (error) {
  } finally {
    await client.end();
  }
};
