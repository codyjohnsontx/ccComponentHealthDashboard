import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";

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
      "no-undef": "off",
      "no-unused-vars": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off"
    }
  }
];

export default config;
