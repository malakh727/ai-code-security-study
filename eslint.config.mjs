import js from "@eslint/js";
import globals from "globals";

// `defineConfig` import from "eslint/config" can fail with some installed
// ESLint versions because the package doesn't export the './config' subpath.
// Returning the flat config array directly avoids importing that subpath.
// include the @eslint/js recommended config object directly (flat config doesn't
// support the "extends" key).
const recommended = js.configs && js.configs.recommended ? js.configs.recommended : {};

export default [
  // base rules from @eslint/js
  recommended,
  // project-wide override for JS-like files
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
];
