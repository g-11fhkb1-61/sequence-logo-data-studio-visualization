const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [
    {
        mode: 'production',
        entry: './src/index.js',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: path.join('src/index.css'), to: '.' },
                { from: path.join('src/index.json'), to: '.' },
                { from: path.join('src/manifest.json'), to: '.' }
            ])
        ]
    }
];