export default {
    testEnvironment: 'node',
    transform: {},
    extensionsToTreatAsEsm: ['.js'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    setupFiles: ['./tests/setup.js'],
    setupFilesAfterEnv: ['./tests/setupAfterEnv.js'],
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.js',
      '!src/**/*.test.js'
    ],
    verbose: true
  };