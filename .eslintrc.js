module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
  rules: {
    'prefer-template': 'off',
    'prettier/prettier': 'warn',
    'no-console': 'off',
    'max-classes-per-file': 'off',
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    camelcase: 1,
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
  },
};
