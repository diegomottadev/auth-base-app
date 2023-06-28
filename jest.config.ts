export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/src/tests/.*\\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  testTimeout: 30000,
};
