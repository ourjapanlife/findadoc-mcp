import globals from 'globals'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintJsPlugin from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'

export default [
    // GLOBAL configuration
    {
        ignores: ['dist/*'],
    },
    // Typescript and JS Linter combined
    {
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node,
                ...globals.es6,
            },
        },
        files: ['src/**/*.ts', 'tests/**/*.ts'],
        plugins: { '@typescript-eslint': ts, ts, '@stylistic': stylistic },
        rules: {
            // TS specific rules
            ...ts.configs['eslint-recommended'].rules,
            ...ts.configs.recommended.rules,
            '@typescript-eslint/no-shadow': 'error',
            '@typescript-eslint/no-unused-vars': 'error',

            // JS specific rules
            ...eslintJsPlugin.configs.recommended.rules,
            'no-unused-vars': 'off',
            'block-scoped-var': 'error',
            complexity: ['error', { max: 40 }],
            'consistent-return': 'error',
            curly: 'error',
            'dot-location': ['error', 'property'],
            'dot-notation': ['error', { allowPattern: '^[a-z]+(_[a-z]+)+$' }],
            'no-alert': 'error',
            'no-multi-spaces': 'error',
            'no-redeclare': 'error',
            'no-unused-expressions': [
                'error',
                { allowShortCircuit: true, allowTernary: true },
            ],
            'vars-on-top': 'off',
            yoda: ['error', 'never', { exceptRange: true }],
            'no-console': 'error',

            // Stylistic Issues and Opinions
            'arrow-body-style': 'error',
            '@stylistic/array-bracket-spacing': ['error', 'never'],
            '@stylistic/arrow-parens': ['error', 'as-needed'],
            '@stylistic/arrow-spacing': 'error',
            '@stylistic/block-spacing': ['error', 'always'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            camelcase: ['warn', {properties: 'never'}],
            '@stylistic/comma-dangle': ['error', 'never'],
            '@stylistic/comma-spacing': [
                'error',
                { before: false, after: true },
            ],
            '@stylistic/comma-style': 'error',
            '@stylistic/computed-property-spacing': ['error', 'never'],
            '@stylistic/function-paren-newline': ['error', 'consistent'],
            '@stylistic/indent': [
                'error',
                4,
                {
                    MemberExpression: 1,
                    SwitchCase: 1,
                    ArrayExpression: 'first',
                    ObjectExpression: 1,
                    FunctionDeclaration: { parameters: 'off' },
                    VariableDeclarator: { var: 2, let: 2, const: 3 },
                    CallExpression: { arguments: 'first' },
                },
            ],
            '@stylistic/key-spacing': [
                'error',
                { beforeColon: false, afterColon: true },
            ],
            '@stylistic/keyword-spacing': [
                'error',
                { before: true, after: true },
            ],
            '@stylistic/linebreak-style': ['error', 'unix'],
            '@stylistic/max-len': [
                'error',
                {
                    code: 120,
                    ignoreComments: true,
                    ignoreTrailingComments: true,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreRegExpLiterals: true,
                },
            ],
            'newline-after-var': 'error',
            'require-atomic-updates': 'warn',
            'no-constant-condition': 'error',
            'no-dupe-class-members': 'error',
            'no-lonely-if': 'error',
            '@stylistic/no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
            'no-underscore-dangle': 'error',
            'no-var': 'error',
            '@stylistic/object-curly-newline': ['error', { consistent: true }],
            '@stylistic/object-property-newline': [
                'error',
                { allowAllPropertiesOnSameLine: true },
            ],
            'object-shorthand': ['error', 'methods'],
            '@stylistic/operator-linebreak': [0, 'before'],
            '@stylistic/padded-blocks': ['error', 'never'],
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-spread': 'error',
            'prefer-template': 'error',
            '@stylistic/quote-props': ['error', 'as-needed'],
            '@stylistic/quotes': ['error', 'single', 'avoid-escape'],
            '@stylistic/semi': ['error', 'never'],
            '@stylistic/semi-spacing': 'error',
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-before-function-paren': [
                'error',
                { anonymous: 'never', named: 'never', asyncArrow: 'always' },
            ],
            '@stylistic/space-in-parens': 'error',
            '@stylistic/space-infix-ops': 'error',
        },
    },
]
