import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

const JS_TS_FILES = ['**/*.js', '**/*.mjs', '**/*.cjs', '**/*.ts'];

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '**/*.min.js']
  },
  {
    files: JS_TS_FILES,
    ...js.configs.recommended
  },
  {
    files: JS_TS_FILES,
    ...prettierConfig
  },
  {
    files: JS_TS_FILES,
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-destructuring': ['error', { object: true, array: false }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      eqeqeq: ['error', 'always'],
      'no-else-return': 'error',
      'no-empty-function': 'warn',
      'no-magic-numbers': ['warn', { ignore: [-1, 0, 1, 2, 100, 1000] }],
      'no-return-await': 'error',
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error',
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'never']
    }
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off'
    }
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'error'
    }
  },
  {
    files: ['scripts/**/*.js'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off'
    }
  }
];
