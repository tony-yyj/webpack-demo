const path = require('path');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: {
        app: './src/index.ts'
    },
    mode: "development",
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: "inline-source-map",
    devServer: {
        contentBase: './dist',
        overlay: true,
        quiet: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "webpack demo",
            filename: "index.html",
            template: "src/index.html",
            inject: "body",
        }),
        new CopyWebpackPlugin([
            {
                from: 'src/assets',
                to: 'assets'
            },
        ])
    ],
};