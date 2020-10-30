const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: tsjPreset.transform,
  collectCoverageFrom: ['./src/**/*.ts'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    './src/environment.ts',
    './src/main.ts',
  ],
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'cobertura'],
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
};
