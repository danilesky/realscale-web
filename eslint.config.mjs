// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import tsParser from '@typescript-eslint/parser'

export default withNuxt(
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      indent: ['error', 2, {
        SwitchCase: 1,
        ignoredNodes: ['TemplateLiteral'],
      }],
    },
  },
)
