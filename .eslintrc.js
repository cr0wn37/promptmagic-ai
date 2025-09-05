/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
  ignorePatterns: ["**/*.js", "**/*.ts", "**/*.tsx"],
};
