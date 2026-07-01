import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  {
    ignores: [
      "src/generated/**",
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "prisma/migrations/**",
    ],
  },
  // Next.js recommended + Core Web Vitals + TypeScript (the strict presets).
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Unused code is a hard error; allow deliberate `_`-prefixed placeholders.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
    },
  },
  // Node scripts (seed/clear) legitimately log progress to stdout.
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
    },
  },
];

export default config;
