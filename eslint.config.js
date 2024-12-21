import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

// https://eslint.org/docs/latest/use/configure/configuration-files
// https://typescript-eslint.io/
// ESLint Stylistic: https://eslint.style/
export default tseslint.config(
    {
        ignores: [
            "dist/"
        ],
    },
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            "@stylistic": stylistic
        },
        files: [
            "**/*.ts",
            "**/*.d.ts",
            "**/*.js"
        ],
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
            ecmaVersion: 2022,
            sourceType: "module",
        },
        rules: {
            "@typescript-eslint/explicit-function-return-type": "error",
            "@stylistic/semi": ["error", "always"],
            "@stylistic/member-delimiter-style": "error",
            quotes: ["error", "double", { avoidEscape: true }],
            "no-console": "off",
            "prefer-const": "error",
            "@typescript-eslint/no-unused-vars": ["warn", {
                varsIgnorePattern: "^_+$",
                argsIgnorePattern: "^_+$",
            }],
            eqeqeq: "error",
            "@typescript-eslint/no-explicit-any": "off",
            "no-unreachable": "warn",
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    }
);
