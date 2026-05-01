// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');

module.exports = tseslint.config(
  {
    ignores: ['dist/', 'node_modules/', '*.d.ts'],
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.spec.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.app.json',
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'warn',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['src/**/*.spec.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.spec.json',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
      'prettier/prettier': 'off',
    },
  },
);
