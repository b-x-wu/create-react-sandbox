#! /usr/bin/env node

// guided by https://blog.shahednasser.com/how-to-create-a-npx-tool/

const fs = require('fs').promises;
const path = require('node:path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fsOptions = { encoding: 'utf-8' }

if (process.argv.length < 3) {
    console.error('Please speicify the project directory')
    process.exit(1)
}

const sandboxDirectory = process.argv[2]

// create the sandbox directory
fs.mkdir(sandboxDirectory).then(() => Promise.all([
    // create the sandbox structure
    fs.mkdir(path.join(sandboxDirectory, 'src')),
    fs.mkdir(path.join(sandboxDirectory, 'public'))
])).then(() => Promise.all([
    // get the contents of the files to be put into the sandbox
    fs.readFile(path.join(__dirname, './static/.babelrc'), fsOptions),
    fs.readFile(path.join(__dirname, './static/index.html'), fsOptions),
    fs.readFile(path.join(__dirname, './static/index.jsx'), fsOptions),
    fs.readFile(path.join(__dirname, './static/webpack.config.js'), fsOptions),
    fs.readFile(path.join(__dirname, './static/package.json'), fsOptions)
])).then((fileTexts) => {
    // create the files in the sandbox
    const [babelrcText, indexHtmlText, indexJsxText, webpackConfigText, packageJsonText] = fileTexts
    const packageOptions = JSON.parse(packageJsonText)
    packageOptions.name = sandboxDirectory

    return Promise.all([
        fs.writeFile(path.join(sandboxDirectory, './.babelrc'), babelrcText),
        fs.writeFile(path.join(sandboxDirectory, './public/index.html'), indexHtmlText),
        fs.writeFile(path.join(sandboxDirectory, './src/index.jsx'), indexJsxText),
        fs.writeFile(path.join(sandboxDirectory, './webpack.config.js'), webpackConfigText),
        fs.writeFile(path.join(sandboxDirectory, './package.json'), JSON.stringify(packageOptions, null, 4))
    ])
}).then(() => exec(`cd ${sandboxDirectory} && npm install`)).then(() => { // initialize the project
    console.log(`React sandbox is set up. Run \`cd ${sandboxDirectory} && npm start\` to begin.`)
}).catch((err) => {
    console.log(err)
})
