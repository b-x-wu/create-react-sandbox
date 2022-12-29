const path = require("path")
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: process.env.NODE_ENV ?? "development", 
    entry: "./src/index.jsx", 
    plugins: [
        new HtmlWebpackPlugin({
            template: 'public/index.html'
        })
    ],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js"
    },
    target: "web",
    devServer: {
        port: process.env.PORT ?? "3001",
        static: ["./dist"],
        open: true,
        hot: true
    },
    resolve: {
        extensions: ['.js','.jsx','.json'] 
    },
    module:{
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use:  'babel-loader'
            }
        ]
    }
}
