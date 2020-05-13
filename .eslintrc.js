module.exports = {
  env: {
    // supporting all kind of environment 
    // to build universal lib
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    'google', // google style guide
    'plugin:jest/recommended', // jest support
    'plugin:jest/style', // style for jest files
    'plugin:jsdoc/recommended', // jsdoc rules to document code 
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['json', 'import', 'jsdoc', 'jest', '@typescript-eslint'],
  ignorePatterns: ['/*', '!src'],
  rules: {
    'require-jsdoc': 0, // jsdoc is not mandatory on functions
    // disable eslint jsdoc internal check, already done by "jsdoc" plugin
    'valid-jsdoc': 0,
    'max-len': 0, // disable max length check of code lines
    // disable the rule for all files
    "@typescript-eslint/explicit-function-return-type": "off",
    "new-cap": 0,
    "jsdoc/require-returns" : "off",
    "jsdoc/require-param-description" : "off"
  },
  "overrides": [
    {
      // enable the rule specifically for TypeScript files
      "files": ["*.ts", "*.tsx"],
      "rules": {
        "@typescript-eslint/explicit-function-return-type": ["error"]
      }
    }
  ],
  settings: {
    jsdoc: {
      preferredTypes: {
        object: 'Object',
      },
    },
  },
};
