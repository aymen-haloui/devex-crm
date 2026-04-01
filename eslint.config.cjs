module.exports = [
  {
    ignores: ["node_modules/**", ".next/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      react: require("eslint-plugin-react"),
      "jsx-a11y": require("eslint-plugin-jsx-a11y"),
      "react-hooks": require("eslint-plugin-react-hooks"),
    },
    settings: { react: { version: "detect" } },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react/recommended",
      "plugin:jsx-a11y/recommended",
      "plugin:react-hooks/recommended",
      "next/core-web-vitals",
    ],
    rules: {
      // allow any for now where TS types are loose
      "@typescript-eslint/no-explicit-any": "off",
      // allow local dev patterns
      "react/react-in-jsx-scope": "off",
    },
  },
];
