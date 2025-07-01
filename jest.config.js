module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // globalSetup: './test/utils/globalSetup.ts',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleDirectories: ['node_modules', 'src', 'test'],
  setupFiles: ['dotenv/config'],
  testSequencer: './test/utils/testSequencer.js',
  testTimeout: 30000,
};
