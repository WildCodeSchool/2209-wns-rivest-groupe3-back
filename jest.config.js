/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15 * 1_000,
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
