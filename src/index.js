// activate support for `import`/`export` (required for non-JSX ES modules)
require = require('esm')(module, { cjs: true })
require('@babel/register')({
    extensions: ['.js'],
    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        ['@babel/preset-react'],
    ],
})
require('./main')
