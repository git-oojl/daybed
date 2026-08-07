import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "playwright-report", "test-results"]),

  {
    files: ["**/*.{js,jsx}"],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    /*
     * Daybed intentionally starts async data loaders from effects.
     *
     * eslint-plugin-react-hooks 7's recommended preset flags these because
     * the called loader functions update React state. That pattern is used
     * throughout the existing application and is not itself a build/runtime
     * failure.
     *
     * Keep the rest of the React Hooks rules enabled.
     */
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },

  /*
   * Entry modules and the dev-preview registry are not Fast Refresh component
   * modules, so only-export-components is not meaningful for these files.
   */
  {
    files: [
      "src/main.jsx",
      "src/dev-preview/viewPreviewRegistry.jsx",
    ],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },

  {
    files: ["vite.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
