/**
 Configuration for test environment JEST
 */

module.exports = {
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "./test",
  ],
  // adds custom messages to Jest expect
  // https://github.com/mattphillips/jest-expect-message
  "setupFilesAfterEnv": ["jest-expect-message"],
  // https://www.npmjs.com/package/identity-obj-proxy
  // *.css and *.less files will be mocked
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy"
  },
  // https://www.npmjs.com/package/babel-jest
  // using babel to transform the jest related code
  "transform": {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
};