export default {
  moduleFileExtensions: ['js', 'json'],

  transform: { '^.+\\.js?$': 'babel-jest' },

  transformIgnorePatterns: ['node_modules/(?!(@hckrnews|@ponbike)/)'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  testMatch: ['**/__tests__/*.js'],

  testURL: 'http://localhost:8080/',

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/src/run.js', '__fixtures__', '__tests__', 'seeders'],

  setupFiles: ['./.jest/setEnvVars.js'],
  reporters: [
    'default',
    [ 'jest-junit', {
      outputDirectory: 'test-reports',
      outputName: 'jest-junit.xml',
    } ]
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 80,
      statements: 80
    }
  },

  testResultsProcessor: 'jest-sonar-reporter'
}
