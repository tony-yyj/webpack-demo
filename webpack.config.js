const path = require('path')

module.exports = {
    entry: './src/index.js',
    devServer: {
        port: 8080,
        static: path.resolve(__dirname, 'src'),
    },
    mode: "development",
    resolve: {
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
        }
    }

}
