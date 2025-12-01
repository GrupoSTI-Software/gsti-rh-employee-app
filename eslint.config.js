import js from '@eslint/js'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettierPlugin from 'eslint-plugin-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import unicornPlugin from 'eslint-plugin-unicorn'

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'babel.config.js',
      'babel.config.cjs',
      'commitlint.config.js',
      'commitlint.config.cjs',
      'App copy.tsx',
      'App.tsx',
      '**/docs/**'
    ]
  },
  // JS files (babel config, etc.)
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        module: 'writable',
        require: 'readonly',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly'
      }
    }
  },
  // Base config for TypeScript and React files
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'prettier': prettierPlugin,
      'unicorn': unicornPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },
        project: './tsconfig.json'
      },
      globals: {
        React: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
        console: 'readonly',
        require: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Promise: 'readonly',
        NodeJS: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'eol-last': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'indent': ['error', 2],
      'no-console': ['error', { allow: ['error'] }],
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      'react/react-in-jsx-scope': 'off',
      'no-unused-vars': 'off'
    }
  },
  // Override for App.tsx and App copy.tsx
  {
    files: ['App.tsx', 'App copy.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off'
    }
  },
  // Override for presentation files
  {
    files: ['presentation/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  },
  {
    files: ['navigation/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  },
  // Naming conventions for src files
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        // Clases en PascalCase
        {
          selector: 'class',
          format: ['PascalCase']
        },
        // Interfaces en PascalCase
        {
          selector: 'interface',
          format: ['PascalCase']
        },
        // Types en PascalCase
        {
          selector: 'typeAlias',
          format: ['PascalCase']
        },
        // Enums en PascalCase
        {
          selector: 'enum',
          format: ['PascalCase']
        },
        // Funciones en camelCase
        {
          selector: 'function',
          format: ['camelCase']
        },
        // Variables en camelCase
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'] // Permitir constantes en UPPER_CASE
        },
        // Propiedades en camelCase
        {
          selector: 'property',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          filter: { regex: '.*', match: false }, // ignora string literals
        },
        // Parámetros en camelCase
        {
          selector: 'parameter',
          format: ['camelCase']
        }
      ],
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase'
        }
      ],
    }
  }
] 