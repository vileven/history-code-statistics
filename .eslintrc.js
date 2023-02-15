module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint', 'prettier'],
    settings: {
        'import/resolver': {
            node: {
                extensions: [
                    '.js',
                    '.jsx',
                    '.mjs',
                    '.cjs',
                    '.ts',
                    '.tsx',
                    '.mts',
                    '.cts',
                    '.es6',
                    '.es',
                    '.json'
                ]
            }
        }
    },
    parser: '@typescript-eslint/parser',

    rules: {
        'prettier/prettier': 'error'
    }
};
