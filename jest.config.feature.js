export default {
  moduleFileExtensions: ['js', 'json'],

  transform: { '^.+\\.js?$': 'babel-jest' },

  transformIgnorePatterns: ['node_modules/(?!(@hckrnews|@ponbike)/)'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  testMatch: ['**/__tests__/*.feature.js'],

  testURL: 'http://localhost:8080/',

  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/src/run.js', '__fixtures__', '__tests__'],

  setupFiles: ['./.jest/setEnvVars.js']
}
