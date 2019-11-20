const esModules = ['interface-datastore'].join('|');
module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  collectCoverage: false,
  testEnvironment: './jest.env.js',
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
