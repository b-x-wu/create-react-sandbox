import path from 'path'
import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    mode: process.env.NODE_ENV ?? "development", 
    entry: "./src/index.tsx", 
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
        extensions: ['.tsx', '.ts', '.js','.jsx','.json'] 
    },
    module:{
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    }
}

