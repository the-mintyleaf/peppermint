import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    // Document templates are vendored, view-locked markup copied verbatim from mintway —
    // their rendered output must stay byte-identical, so we do not rewrite them to satisfy
    // lint. Relax the code-style rules that fire on the copied source only.
    files: ["components/templates/**/*.{ts,tsx}"],
    linterOptions: { reportUnusedDisableDirectives: "off" },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/static-components": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "no-console": "off",
    },
  },
]);

export default eslintConfig;
