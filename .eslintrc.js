module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
    'plugin:prettier/recommended', // configures both eslint-plugin-prettier and eslint-config-prettier
    'plugin:react/jsx-runtime',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/prop-types': 'off',
    'react/destructuring-assignment': 'off',
    'react/sort-comp': 'off',
    'no-alert': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-nested-ternary': 'off',
    'react/no-array-index-key': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-unused-vars': 'off',
    'import/prefer-default-export': 'off',
    'max-classes-per-file': 'off',
    'lines-between-class-members': 'off',
    'import/extensions': 'off',
  },
};
