import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        languageOptions: {
            globals: globals.node,
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            semi: ["error", "always"],
            quotes: ["error", "double", { avoidEscape: true }],
            "no-console": "off",
            "prefer-const": "error",
            "no-unused-vars": ["warn", {
                varsIgnorePattern: "^_+$",
                argsIgnorePattern: "^_+$",
            }],
        },
    },
    pluginJs.configs.recommended,
];
