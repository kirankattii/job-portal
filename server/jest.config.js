module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/../tests'],
  testMatch: ['**/?(*.)+(test).[jt]s'],
  verbose: false,
  moduleNameMapper: {
    '^supertest$': '<rootDir>/node_modules/supertest',
    '^jsonwebtoken$': '<rootDir>/node_modules/jsonwebtoken',
  },
};


