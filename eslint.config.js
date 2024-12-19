import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    {
        ignores: [
            "dist/"
        ],
    },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    {
        plugins: {
            "@typescript-eslint": tseslint.plugin
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
                project: [
                    "./tsconfig.json",
                    // necessary for linting the eslint.config.js file itself 
                    // because eslint uses the "compilerOptions.include" key of 
                    // the tsconfig to determine which files to lint, but if we 
                    // put eslint.config.js in the tsconfig.json then typescript
                    // would try to compile it
                    "./tsconfig.eslint.json"
                ]
            },
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
            eqeqeq: "error",
            "@typescript-eslint/no-explicit-any": "off"
        },
    }
);
