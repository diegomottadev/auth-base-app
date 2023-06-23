export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '/src/tests/.*\\.(test|spec)\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
