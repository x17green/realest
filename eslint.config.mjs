import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'

export default [
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['node_modules/**', '.next/**', 'public/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Base TS hygiene
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Guardrail: discourage new Shadcn imports outside allowlist
      'no-restricted-syntax': [
        'warn',
        {
          selector:
            "ImportDeclaration[source.value=/^@\\/components\\/ui\\/(?!command|combobox|context-menu|data-table)(.+)/]",
          message:
            'Prefer HeroUI/UntitledUI for new components. Allowed Shadcn modules: command, combobox, context-menu, data-table.',
        },
      ],
    },
  },
]
