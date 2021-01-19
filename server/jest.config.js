module.exports = {
  globals: {
    "ts-jest": {
        tsConfig: "./server/tsconfig.spec.json",
        isolatedModules: false
    }
  },
  moduleFileExtensions: [
      "ts",
      "js"
  ],
  transform: {
      "^.+\\.(ts|tsx)$": "ts-jest"
  },
  testMatch: [
      "**/*.spec.ts"
  ],
  testEnvironment: "node"
};