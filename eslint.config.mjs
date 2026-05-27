import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/generated/**",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 80, skipBlankLines: true, skipComments: true }],
      "complexity": ["warn", { max: 12 }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    files: ["src/themes/**/*.{ts,tsx}"],
    rules: {
      // RTL safety: forbid physical direction utilities in theme code.
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\b(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right)/]",
          message: "Use logical Tailwind utilities (ms-, me-, ps-, pe-, start-, end-, text-start, text-end) in themes.",
        },
      ],
    },
  },
]);

export default eslintConfig;
