// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // ── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '**/*.min.js', '**/*.d.ts']
  },

  // ── JS recommended (all files) ────────────────────────────────────────────
  js.configs.recommended,

  // ── TypeScript: strict + type-checked + stylistic (TS files only) ─────────
  {
    files: ['**/*.ts', '**/*.mts', '**/*.cts'],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    plugins: {
      import: importPlugin
    },
    rules: {
      // ── TypeScript ──────────────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports', fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/consistent-type-exports': 'error',

      // ── Imports ─────────────────────────────────────────────────────────
      'import/no-duplicates': 'error',
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',

      // ── Logic / security ────────────────────────────────────────────────
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
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
      'no-throw-literal': 'error',
      'prefer-promise-reject-errors': 'error'
    }
  },

  // ── JS/MJS/CJS files: type-checked rules disabled (no tsconfig available) ─
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022
      }
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-var': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      eqeqeq: ['error', 'always']
    }
  },

  // ── Prettier: must be last to disable all formatting rules ────────────────
  prettierConfig,

  // ── Per-folder overrides ──────────────────────────────────────────────────
  {
    files: ['scripts/**/*.js', 'scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off'
    }
  },
  {
    files: ['test/**/*.js', 'test/**/*.ts'],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  },
  {
    files: [
      'patterns/**/examples/**/*.js',
      'patterns/**/examples/**/*.ts',
      'patterns/**/tests/**/*.ts',
      'patterns/**/libraries/**/*.js'
    ],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off'
    }
  },
  {
    files: ['patterns/shared-infrastructure/**/*.ts', 'patterns/shared-infrastructure/**/*.js'],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off'
    }
  },
  {
    files: ['patterns/ai-tools/**/*.js', 'patterns/plugin-system/**/*.js'],
    rules: {
      'no-console': 'off',
      'no-magic-numbers': 'off'
    }
  },
  {
    files: ['patterns/ide-extensions/**/*.ts'],
    rules: {
      'no-empty-function': 'off'
    }
  }
);
