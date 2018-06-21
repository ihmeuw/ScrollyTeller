module.exports = {
  root: true,
  parser: 'babel-eslint', // not necessary because of webpack parser?
  extends: 'airbnb',
  plugins: [
    "react",
    "jsx-a11y",
    "import"
  ],
  rules: {
    'arrow-body-style': [2, 'always'],
    'no-underscore-dangle': 0,
    'react/jsx-no-bind': 0,
    'require-jsdoc': ['warn', {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true
      },
    }],
    'valid-jsdoc': 'error',
    'max-len': [2, 100, 2, { 'ignoreUrls': true, 'ignoreComments': true }],
    'no-param-reassign': ['error', { 'props': false }],
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'class-methods-use-this': 0,
  },
  settings: {
    'import/core-modules': [ 'jquery', 'vizhub' ],
    'import/resolver': 'webpack',
  },
  env: {
    mocha: true
  }
};
