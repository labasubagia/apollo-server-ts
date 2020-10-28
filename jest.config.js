module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  collectCoverageFrom: ['./src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    './src/environment.ts',
    './src/main.ts',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'],
  preset: 'ts-jest',
  testEnvironment: 'node',
};
