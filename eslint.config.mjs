import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/coverage/**",
      "**/dist/**",
      "**/supabase/**",
      "**/scripts/**",
      "**/tests/**",
      "**/data/**",
      "**/docs/**",
      "next-env.d.ts",
      "test-*.js"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off"
    }
  },
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/*.{ts,tsx}"]
  }
];

export default eslintConfig;
