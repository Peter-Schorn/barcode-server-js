import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

// https://eslint.org/docs/latest/use/configure/configuration-files
// https://typescript-eslint.io/
// ESLint Stylistic: https://eslint.style/packages/default
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
            "@stylistic/member-delimiter-style": ["error", {
                multiline: {
                    delimiter: "semi",
                    requireLast: true
                },
                singleline: {
                    delimiter: "comma",
                    requireLast: false
                },
            }],
            quotes: ["error", "double", { avoidEscape: true }],
            "no-console": "off",
            "prefer-const": "error",
            "@typescript-eslint/no-unused-vars": ["warn", {
                varsIgnorePattern: "^_+$",
                argsIgnorePattern: "^_+$"
            }],
            eqeqeq: "error",
            "no-unreachable": "warn",
            "@stylistic/max-len": ["error", {
                code: 80,
                // ignore eslint-disable comments
                ignorePattern: "^\\s*//\\s*eslint-disable",
                ignoreComments: false,
            }],
            "no-var": "error",
            
            // might want to reenable these
            "@typescript-eslint/no-unsafe-member-access": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
            
            // probably should stay off
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/restrict-template-expressions": "off"
        },
    }
);
