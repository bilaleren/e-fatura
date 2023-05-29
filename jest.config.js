/** @type {import('@jest/types').Config} */
const config = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts', 'tsx', 'json'],
  rootDir: './src',
  testRegex: '.*\\.test\\.ts(x)?$',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: true
      }
    ]
  },
  testEnvironment: 'node'
}

module.exports = config
