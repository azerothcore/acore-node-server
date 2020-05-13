const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require("webpack")

module.exports = {
    entry: './src/index.ts',
    mode: "production",
    output: {
        filename: 'index.js', // <-- Important
        libraryTarget: 'this' // <-- Important
    },
    target: 'node', // <-- Important
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            },
            {
                test: /\.jsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    externals: [nodeExternals()], // <-- Important
    optimization: {
        minimizer: [new UglifyJsPlugin({
            sourceMap: true,
        })],
    },
    devtool: false,
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[name].js.map',
        })
    ]
};