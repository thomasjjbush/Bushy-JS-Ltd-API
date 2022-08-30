import type { InitialOptionsTsJest } from 'ts-jest/dist/types';

const config: InitialOptionsTsJest = {
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['<rootDir>/src/db/*', '<rootDir>/src/testing/*', '<rootDir>/src/types/*'],
  moduleNameMapper: {
    '^controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^db/(.*)$': '<rootDir>/src/db/$1',
    '^graphql-queries/(.*)$': '<rootDir>/src/graphql-queries/$1',
    '^middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^testing/(.*)$': '<rootDir>/src/testing/$1',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
};

export default config;
