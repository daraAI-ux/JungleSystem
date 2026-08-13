const config = {
  moduleNameMapper: {
    '\\.(wav)$': '<rootDir>/__mocks__/asset-file.js',
  },
};

module.exports = require('@rnx-kit/jest-preset')('windows', config);
