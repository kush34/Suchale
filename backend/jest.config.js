/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',          // tell Jest to use ts-jest to compile TS
  testEnvironment: 'node',    // Node backend
  testMatch: ['**/tests/**/*.test.ts'], // your test files pattern
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // make sure it points to your TS config
    },
  },
};
