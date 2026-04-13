import nextConfig from 'eslint-config-next/core-web-vitals'
import prettier from 'eslint-config-prettier/flat'

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextConfig,
  prettier,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**'],
  },
  {
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
