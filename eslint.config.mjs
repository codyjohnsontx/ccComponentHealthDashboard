import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

const config = [
  {
    ignores: [
      ".next/**",
      ".next_stale_runtime_fix/**",
      ".next_stale_runtime_fix_2/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**"
    ]
  },
  js.configs.recommended,
  ...nextVitals,
  {
    rules: {
      "no-console": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off"
    }
  },
  {
    // The base `no-undef` and `no-unused-vars` rules cannot read TypeScript type
    // positions: they report the `React` UMD namespace and every parameter name
    // inside a function type annotation. `tsc --noEmit` (pnpm run check:types)
    // already covers undefined identifiers, so on TypeScript sources we swap the
    // base unused-vars rule for the typescript-eslint one and drop `no-undef`.
    // Both base rules stay enabled on plain JS/MJS/CJS files.
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    plugins: {
      "@typescript-eslint": tseslint.plugin
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ]
    }
  }
];

export default config;
