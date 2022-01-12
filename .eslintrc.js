module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['plugin:react/recommended', 'airbnb'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'linebreak-style': 0,
    'react/jsx-filename-extension': 0,
    'no-plusplus': 0,
    'comma-dangle': 0,
    'prefer-destructuring': 0,
    'react/prefer-stateless-function': 0,
    camelcase: 0,
  },
};
